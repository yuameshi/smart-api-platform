import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { AssertStepConfig, RequestStepConfig, SentHttpResponse, StepRunResult, TestRunContext } from 'shared';
import type { TestStep } from '../entities/test-step.entity';
import type { TestFlowRun } from '../entities/test-flow-run.entity';

import { evaluateAssertion, resolveAssertLeft } from './assertion-evaluator';
import { buildHttpRequest, collectTemplates, parseResponseJson, batchExtractVariables, shrinkResponseBody } from './step-executor';
import { findMissingVariables, renderTemplate } from './variable-manager';
import { HttpRequestsService } from '@/modules/http-request/http-request.service';
import { TestFlowService } from '../test-flow.service';
import { TestFlowRunRecordService } from '../run/test-flow-run-record.service';
import { RunEventStream } from '../run/run-event-stream';

@Injectable()
export class TestFlowRunnerService {
	private readonly logger = new Logger(TestFlowRunnerService.name);

	// runId为索引获取对应的AbortController
	private readonly abortControllersMap = new Map<number, AbortController>();

	// runid为索引，记录每个运行进程的最新上下文状态
	private readonly testRunContextMap = new Map<number, TestRunContext>();

	// 防止同一流程并发运行
	private readonly runningFlowsMap = new Map<number, number>();

	constructor(
		private readonly testFlowService: TestFlowService,
		private readonly runRecordService: TestFlowRunRecordService,
		private readonly httpRequestsService: HttpRequestsService,
		private readonly eventStream: RunEventStream,
	) {}

	async startRun(flowId: number, userId: number, isAdmin: boolean): Promise<TestFlowRun> {
		const flow = await this.testFlowService.findOneOwned(flowId, userId, isAdmin);
		const steps = await this.testFlowService.listSteps(flow.id, userId, isAdmin);
		if (steps.length === 0) {
			throw new BadRequestException('流程为空，无法运行');
		}

		// 同一流程不允许并发运行
		const runningRunId = this.runningFlowsMap.get(flow.id);
		if (runningRunId !== undefined) {
			throw new ConflictException(
				runningRunId > 0 ? `该流程正在运行中（运行#${runningRunId}），请先停止` : '该流程正在启动中，请稍后重试',
			);
		}
		// 加锁
		this.runningFlowsMap.set(flow.id, 0);

		const startedAt = Date.now();
		let run: TestFlowRun;
		try {
			const existing = await this.runRecordService.findRunningByFlow(flow.id);
			if (existing) {
				throw new ConflictException(`该流程正在运行中（运行#${existing.id}），请先停止`);
			}
			run = await this.runRecordService.createRunningRecord(flow.id, steps.length, startedAt);
		} catch (error) {
			// 创建失败要释放锁
			this.runningFlowsMap.delete(flow.id);
			throw error;
		}
		this.runningFlowsMap.set(flow.id, run.id);

		const controller = new AbortController();
		this.abortControllersMap.set(run.id, controller);
		this.testRunContextMap.set(run.id, {
			status: 'running',
			currentStepIndex: -1,
			totalSteps: steps.length,
			vars: {},
			results: [],
			error: null,
			startedAt,
			endedAt: null,
		});

		void this.execute(run.id, flow.projectId, steps, userId, isAdmin, controller)
			.catch((error: unknown) => {
				this.logger.error(`测试运行#${run.id}出现异常：${error instanceof Error ? error.stack : String(error)}`);
				return this.completeRunWithFailure(run.id, error);
			})
			.finally(() => {
				// 5分钟后清理上下文
				const timeoutId = setTimeout(
					() => {
						this.testRunContextMap.delete(run.id);
						clearTimeout(timeoutId);
					},
					1000 * 60 * 5,
				);
				this.abortControllersMap.delete(run.id);
				this.runningFlowsMap.delete(flow.id);
			});

		return run;
	}

	stopRun(runId: number): void {
		const controller = this.abortControllersMap.get(runId);
		if (!controller) {
			throw new NotFoundException('运行不存在或已结束');
		}
		controller.abort();
	}

	// 通过runId获取最新运行状态
	getLatestContext(runId: number): TestRunContext | undefined {
		return this.testRunContextMap.get(runId);
	}

	// 吧数据库里的记录转成context，通过sse下发
	contextFromRunRecord(run: TestFlowRun): TestRunContext {
		return {
			status: run.status,
			currentStepIndex: -1,
			totalSteps: run.totalSteps,
			vars: run.finalVars,
			results: run.stepResults,
			error: run.error,
			startedAt: new Date(run.startedAt).getTime(),
			endedAt: run.endedAt === null ? null : new Date(run.endedAt).getTime(),
		};
	}

	// ================================
	// 执行测试核心逻辑
	private async execute(
		runId: number,
		projectId: number,
		steps: TestStep[],
		userId: number,
		isAdmin: boolean,
		controller: AbortController,
	): Promise<void> {
		const orderedSteps = [...steps].sort((a, b) => a.order - b.order);
		let context = this.testRunContextMap.get(runId);
		if (!context) return;
		// 记录上一个返回的response json用于断言
		let lastResponseJson: unknown = undefined;

		// 全局同步更新进度
		const publish = async (next: TestRunContext): Promise<void> => {
			context = next;
			this.testRunContextMap.set(runId, next);
			await this.runRecordService.saveProgress(runId, next);
			this.eventStream.emit({ runId, context: next });
		};

		// 替换第index步的执行记录
		const replaceResult = (index: number, result: StepRunResult): StepRunResult[] =>
			(context?.results ?? []).map((item, i) => (i === index ? result : item));

		// 失败终止测试
		const failRun = async (index: number, context: TestRunContext, result: StepRunResult, message: string): Promise<void> => {
			await publish({
				...context,
				status: 'failed',
				error: message,
				endedAt: Date.now(),
				results: replaceResult(index, { ...result, status: 'failed', error: message }),
			});
		};

		// 手动终止测试
		// index传-1代表非正在运行
		const stopRun = async (index: number, context: TestRunContext, result?: StepRunResult): Promise<void> => {
			const current = context;
			await publish({
				...current,
				status: 'stopped',
				endedAt: Date.now(),
				results: result === undefined ? current.results : replaceResult(index, { ...result, status: 'stopped' }),
			});
		};

		for (let index = 0; index < orderedSteps.length; index++) {
			// 开始前检测是否被停止
			if (controller.signal.aborted) return stopRun(-1, context);

			const step = orderedSteps[index];
			const stepStartedAt = Date.now();
			const runningResult: StepRunResult = {
				stepId: step.id,
				order: step.order,
				type: step.type,
				name: step.name,
				status: 'running',
				startedAt: stepStartedAt,
				durationMs: 0,
			};
			await publish({
				...context,
				currentStepIndex: index,
				results: [...(context?.results ?? []), runningResult],
			});

			// 请求步骤
			if (step.type === 'request') {
				const config = step.config as RequestStepConfig;
				// 渲染变量前检测引用的变量是否都已定义
				const missingVars = findMissingVariables(collectTemplates(config), context.vars);
				if (missingVars.length > 0) {
					return failRun(
						index,
						context,
						{ ...runningResult, durationMs: Date.now() - stepStartedAt },
						`存在未定义的变量：${missingVars.join('、')}`,
					);
				}
				// 组装请求，渲染变量模板
				const request = buildHttpRequest(config, projectId, context.vars);
				// 发请求
				const response: SentHttpResponse = await this.httpRequestsService.send(request, userId, isAdmin, {
					signal: controller.signal,
				});
				// 减少body储存量
				const storedResponse = shrinkResponseBody(response);
				// 用户手动停止
				if (controller.signal.aborted) {
					return stopRun(index, context, {
						...runningResult,
						request,
						response: storedResponse,
						durationMs: Date.now() - stepStartedAt,
					});
				}
				if (!response.ok) {
					const NETWORK_ERROR_MESSAGE = {
						timeout: '请求超时',
						'invalid-url': '请求地址无效',
						unknown: '网络请求失败',
					};
					return failRun(
						index,
						context,
						{
							...runningResult,
							request,
							response: storedResponse,
							durationMs: Date.now() - stepStartedAt,
						},
						`网络错误：${NETWORK_ERROR_MESSAGE[response.error.kind]}${response.error.message ? `（${response.error.message}）` : ''}`,
					);
				}

				// 解析并更新最近一次响应
				const responseJson = parseResponseJson(response);
				lastResponseJson = responseJson;

				// 执行提取变量
				const enabledRules = config.extractions.filter(rule => rule.enabled);
				let variables = context.vars;
				let extracted: { variableName: string; value: string }[] = [];
				if (enabledRules.length > 0) {
					const extractVarResult = batchExtractVariables(enabledRules, responseJson, variables);
					extracted = extractVarResult.extracted;
					variables = extractVarResult.variables;
					if (!extractVarResult.ok) {
						// 提取失败，先写入已提取的变量再终止
						await publish({ ...context, vars: variables });
						return failRun(
							index,
							context,
							{
								...runningResult,
								request,
								response: storedResponse,
								responseJson,
								extracted,
								durationMs: Date.now() - stepStartedAt,
							},
							`变量提取失败：${extractVarResult.reason}`,
						);
					}
				}
				await publish({
					...context,
					vars: variables,
					results: replaceResult(index, {
						...runningResult,
						status: 'success',
						durationMs: Date.now() - stepStartedAt,
						request,
						response: storedResponse,
						responseJson,
						extracted,
					}),
				});
				continue;
			}

			// 断言步骤
			const config = step.config as AssertStepConfig;
			// 同样先检测变量是否已定义
			const missingVars = findMissingVariables([config.left.value, config.expected], context.vars);
			if (missingVars.length > 0) {
				return failRun(
					index,
					context,
					{ ...runningResult, durationMs: Date.now() - stepStartedAt },
					`存在未定义的变量：${missingVars.join('、')}`,
				);
			}
			const leftValue = resolveAssertLeft(config.left, context.vars, lastResponseJson);
			// 期望值里也可以写{{变量}}
			const assertion = evaluateAssertion(leftValue, config.operator, renderTemplate(config.expected, context.vars));
			const done: StepRunResult = {
				...runningResult,
				status: assertion.pass ? 'success' : 'failed',
				durationMs: Date.now() - stepStartedAt,
				assertion,
			};
			if (!assertion.pass) {
				return failRun(index, context, done, `断言失败（第${index + 1}步，${step.name}）：${assertion.message}`);
			}
			await publish({
				...context,
				results: replaceResult(index, done),
			});
		}

		// 全部步骤成功完成后标记成成功
		await publish({ ...context, status: 'passed', endedAt: Date.now() });
	}

	// 处理异常
	private async completeRunWithFailure(runId: number, error: unknown): Promise<void> {
		const current = this.testRunContextMap.get(runId);
		const context: TestRunContext = {
			...(current ?? {
				status: 'running',
				currentStepIndex: -1,
				totalSteps: 0,
				vars: {},
				results: [],
				error: null,
				startedAt: Date.now(),
				endedAt: null,
			}),
			status: 'failed',
			error: `运行异常：${error instanceof Error ? error.message : '未知错误'}`,
			endedAt: Date.now(),
		};
		this.testRunContextMap.set(runId, context);
		await this.runRecordService.saveProgress(runId, context);
		this.eventStream.emit({ runId, context });
	}
}
