import { tool } from 'ai';
import type { ToolSet } from 'ai';
import { z } from 'zod';
import { ASSERT_OPERATORS, HTTP_METHODS, TEST_STEP_TYPE } from 'shared';
import type { TestStepConfig } from 'shared';
import type { TestStep } from '@/modules/test-flow/entities/test-step.entity';
import { isStepConfigForType } from '@/modules/test-flow/dto/test-step-validators';
import { executeSafely, type AiToolContext } from './ai-tool-exec-wrapper';

// ================================================
// step config zod schema
const keyValueEntrySchema = z.object({
	key: z.string(),
	value: z.string(),
	active: z.boolean(),
	description: z.string().optional(),
});

const requestBodySchema = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('none') }),
	z.object({ kind: z.literal('raw'), contentType: z.literal('application/json'), raw: z.string() }),
	z.object({ kind: z.literal('formUrlEncoded'), entries: z.array(keyValueEntrySchema) }),
]);

const authSchema = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('none') }),
	z.object({ kind: z.literal('bearer'), token: z.string() }),
	z.object({ kind: z.literal('basic'), username: z.string(), password: z.string() }),
]);

const extractionSchema = z.object({
	variableName: z.string(),
	jsonPath: z.string(),
	defaultValue: z.string().optional(),
	enabled: z.boolean(),
});

const requestStepConfigSchema = z.object({
	method: z.enum(HTTP_METHODS).optional(),
	path: z.string().min(1).max(2048),
	pathParams: z.array(keyValueEntrySchema).optional(),
	params: z.array(keyValueEntrySchema).optional(),
	headers: z.array(keyValueEntrySchema).optional(),
	body: requestBodySchema.optional(),
	auth: authSchema.optional(),
	extractions: z.array(extractionSchema).optional(),
});

const assertStepConfigSchema = z.object({
	left: z.object({
		mode: z.enum(['variable', 'jsonpath', 'literal']),
		value: z.string(),
	}),
	operator: z.enum(ASSERT_OPERATORS),
	expected: z.string(),
});

const stepConfigSchema = z.union([requestStepConfigSchema, assertStepConfigSchema]);
// ================================================

// 补充request步骤中部分可以为空数组的字段
function preprocessStepInput(input: unknown): unknown {
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		return input;
	}
	const record = input as Record<string, unknown>;
	if (record.type !== 'request' || !record.config || typeof record.config !== 'object' || Array.isArray(record.config)) {
		return input;
	}
	const config = record.config as Record<string, unknown>;
	return {
		...record,
		config: {
			...config,
			method: config.method ?? 'GET',
			pathParams: config.pathParams ?? [],
			params: config.params ?? [],
			headers: config.headers ?? [],
			body: config.body ?? { kind: 'none' },
			auth: config.auth ?? { kind: 'none' },
			extractions: config.extractions ?? [],
		},
	};
}

// 转为步骤摘要类型投影
function toStepSummary(step: TestStep) {
	return {
		id: step.id,
		order: step.order,
		type: step.type,
		name: step.name,
	};
}

// 测试步骤相关工具
export function createTestStepTools(ctx: AiToolContext): ToolSet {
	// 校验流程是否属于当前会话，返回流程id
	async function resolveFlowId(testFlowId: number): Promise<number | { ok: false; error: string }> {
		const flow = await ctx.services.testFlowService.findOneOwned(testFlowId, ctx.userId, ctx.isAdmin);
		if (flow.projectId !== ctx.projectId) {
			return {
				ok: false,
				error: '该流程不属于当前项目',
			};
		}
		return flow.id;
	}

	// 列出某流程的步骤摘要
	async function listStepSummaries(flowId: number) {
		const steps = await ctx.services.testFlowService.listSteps(flowId, ctx.userId, ctx.isAdmin);
		return steps.map(toStepSummary);
	}

	return {
		list_test_steps: tool({
			metadata: {
				title: '列出测试步骤',
			},
			description: '列出测试流程下的全部步骤',
			inputSchema: z.object({
				testFlowId: z.number().int().describe('测试流程 ID'),
			}),
			execute: async input =>
				executeSafely(async () => {
					const flowId = await resolveFlowId(input.testFlowId);
					if (typeof flowId !== 'number') {
						return flowId;
					}
					return {
						ok: true as const,
						data: await listStepSummaries(flowId),
					};
				}),
		}),

		get_test_step: tool({
			metadata: {
				title: '查看测试步骤',
			},
			description: '查看单个测试步骤详情',
			inputSchema: z.object({
				testFlowId: z.number().int().describe('测试流程ID'),
				stepId: z.number().int().describe('步骤ID'),
			}),
			execute: async input =>
				executeSafely(async () => {
					const flowId = await resolveFlowId(input.testFlowId);
					if (typeof flowId !== 'number') {
						return flowId;
					}
					const step = await ctx.services.testFlowService.findStepOwned(flowId, input.stepId, ctx.userId, ctx.isAdmin);
					return {
						ok: true as const,
						data: {
							...toStepSummary(step),
							config: step.config,
						},
					};
				}),
		}),

		create_test_step: tool({
			metadata: {
				title: '新建测试步骤',
			},
			description: [
				'在测试流程末尾新增步骤',
				'可以通过指定position来自定义插入位置（从0开始）',
				'示例：',
				'request步骤：',
				'{"testFlowId":1,"type":"request","name":"请求步骤","config":{"method":"GET","path":"/api/users","pathParams":[],"params":[],"headers":[],"body":{"kind":"none"},"auth":{"kind":"none"},"extractions":[]}}',
				'assert步骤：',
				'{"testFlowId":1,"type":"assert","name":"断言步骤","config":{"left":{"mode":"literal","value":"200"},"operator":"eq","expected":"200"}}',
			].join('\n'),
			inputSchema: z.preprocess(
				preprocessStepInput,
				z.object({
					testFlowId: z.number().int().describe('测试流程ID'),
					type: z.enum(TEST_STEP_TYPE).describe('步骤类型（request为发起请求，assert为断言）'),
					name: z.string().min(1).max(100).describe('步骤名称'),
					config: stepConfigSchema.describe('步骤配置，request缺省选项会自动补默认值'),
					position: z.number().int().min(0).optional().describe('插入位置，不传则追加到末尾'),
				}),
			),
			execute: async input =>
				executeSafely(async () => {
					const flowId = await resolveFlowId(input.testFlowId);
					if (typeof flowId !== 'number') {
						return flowId;
					}
					if (!isStepConfigForType(input.type, input.config)) {
						return { ok: false as const, error: '步骤配置和类型不匹配' };
					}
					const config = input.config as TestStepConfig;
					const step = await ctx.services.testFlowService.createStep(
						flowId,
						{ type: input.type, name: input.name, config },
						ctx.userId,
						ctx.isAdmin,
					);
					// 指定了插入位置时，创建后通过重排移动到位
					if (input.position !== undefined) {
						const ids = (await listStepSummaries(flowId)).map(item => item.id);
						const from = ids.indexOf(step.id);
						if (from >= 0) {
							ids.splice(from, 1);
							ids.splice(Math.min(input.position, ids.length), 0, step.id);
							await ctx.services.testFlowService.reorderSteps(flowId, ids, ctx.userId, ctx.isAdmin);
						}
					}
					return {
						ok: true as const,
						data: {
							step: toStepSummary(step),
							steps: await listStepSummaries(flowId),
						},
					};
				}),
		}),

		update_test_step: tool({
			metadata: {
				title: '修改测试步骤',
			},
			description: '更新测试步骤（config 为整体替换）',
			inputSchema: z.preprocess(
				preprocessStepInput,
				z.object({
					testFlowId: z.number().int().describe('测试流程 ID'),
					stepId: z.number().int().describe('步骤 ID'),
					type: z.enum(TEST_STEP_TYPE).optional().describe('步骤类型，不传则保持原类型'),
					name: z.string().min(1).max(100).optional().describe('步骤名称'),
					config: stepConfigSchema.optional().describe('新的步骤配置，request缺省选项会自动补默认值'),
				}),
			),
			execute: async input =>
				executeSafely(async () => {
					const flowId = await resolveFlowId(input.testFlowId);
					if (typeof flowId !== 'number') {
						return flowId;
					}
					const step = await ctx.services.testFlowService.findStepOwned(flowId, input.stepId, ctx.userId, ctx.isAdmin);
					const nextType = input.type ?? step.type;
					if (input.config !== undefined && !isStepConfigForType(nextType, input.config)) {
						return { ok: false as const, error: '步骤配置和类型不匹配' };
					}
					const config = input.config as TestStepConfig | undefined;
					await ctx.services.testFlowService.updateStep(
						flowId,
						step.id,
						{
							...(input.type !== undefined ? { type: input.type } : {}),
							...(input.name !== undefined ? { name: input.name } : {}),
							...(config !== undefined ? { config } : {}),
						},
						ctx.userId,
						ctx.isAdmin,
					);
					return {
						ok: true as const,
						data: { steps: await listStepSummaries(flowId) },
					};
				}),
		}),

		delete_test_step: tool({
			metadata: {
				title: '删除测试步骤',
			},
			description: '删除测试步骤（危险操作，需用户确认后才会执行）',
			inputSchema: z.object({
				testFlowId: z.number().int().describe('测试流程ID'),
				stepId: z.number().int().describe('步骤ID'),
			}),
			needsApproval: true,
			execute: async input =>
				executeSafely(async () => {
					const flowId = await resolveFlowId(input.testFlowId);
					if (typeof flowId !== 'number') {
						return flowId;
					}
					await ctx.services.testFlowService.removeStep(flowId, input.stepId, ctx.userId, ctx.isAdmin);
					return {
						ok: true as const,
						data: {
							deleted: true,
							stepId: input.stepId,
							steps: await listStepSummaries(flowId),
						},
					};
				}),
		}),

		reorder_test_steps: tool({
			metadata: {
				title: '测试步骤排序',
			},
			description: '对测试步骤重新排序',
			inputSchema: z.object({
				testFlowId: z.number().int().describe('测试流程ID'),
				orderedIds: z.array(z.number().int()).min(1).describe('按目标顺序排列的全部步骤ID'),
			}),
			execute: async input =>
				executeSafely(async () => {
					const flowId = await resolveFlowId(input.testFlowId);
					if (typeof flowId !== 'number') {
						return flowId;
					}
					await ctx.services.testFlowService.reorderSteps(flowId, input.orderedIds, ctx.userId, ctx.isAdmin);
					return {
						ok: true as const,
						data: await listStepSummaries(flowId),
					};
				}),
		}),
	};
}

