import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { FC, PropsWithChildren } from 'react';
import type { TestFlowRun, TestRunContext, TestStep } from 'shared';
import { getTestFlowRun, listTestFlowRuns, startTestFlowRun, stopTestFlowRun, streamTestFlowRun } from '@/services/testFlowRuns';
import { StepContext } from './StepContext';
import { UiContext } from './UiContext';
import { PageContext } from '../../PageContext';

// 初始化空上下文
function initTestRunContext(): TestRunContext {
	return {
		status: 'idle',
		currentStepIndex: -1,
		totalSteps: 0,
		vars: {},
		results: [],
		error: null,
		startedAt: 0,
		endedAt: null,
	};
}

export type RunSummary = {
	total: number;
	passed: number;
	finished: number;
	currentStep: TestStep | null;
	currentStepIndex: number;
};

// 给组件快速获取当前执行进度用
// eslint-disable-next-line react-refresh/only-export-components
export const getRunSummary = (context: TestRunContext, steps: TestStep[]): RunSummary => {
	const ordered = [...steps].sort((a, b) => a.order - b.order);
	const running = context.status === 'running';
	return {
		// 未运行/运行中记录按当前步骤列表算
		total: context.status === 'idle' ? ordered.length : context.totalSteps,
		passed: context.results.filter(result => result.status === 'success').length,
		finished: context.results.filter(result => result.status !== 'running').length,
		currentStep: running ? (ordered[context.currentStepIndex] ?? null) : null,
		currentStepIndex: running ? context.currentStepIndex : -1,
	};
};

// eslint-disable-next-line react-refresh/only-export-components
export const RunContext = createContext<{
	runs: TestFlowRun[];
	currentRunContext: TestRunContext;
	currentRunId: number | null;
	setCurrentRunId(id: number | null): void;
	runFlow(): Promise<void>;
	stopFlow(): void;
}>({
	runs: [],
	currentRunId: null,
	currentRunContext: initTestRunContext(),
	setCurrentRunId: () => {},
	runFlow: async () => {},
	stopFlow: () => {},
});

type Props = {
	testFlowId: number;
};

export const RunProvider: FC<PropsWithChildren<Props>> = ({ testFlowId, children }) => {
	const { steps } = useContext(StepContext);
	const { setSnackbar } = useContext(PageContext);
	const { panelView } = useContext(UiContext);

	// 运行记录列表
	const [runs, setRuns] = useState<TestFlowRun[]>([]);
	const [currentRunId, setCurrentRunId] = useState<number | null>(null);

	// 正在运行的测试数据
	const isRunningRef = useRef(false);
	const runningIdRef = useRef<number | null>(null);
	const [runningContext, setRunningContextState] = useState<TestRunContext>(initTestRunContext());
	// 同步保存一份ref，避免sse回调闭包里拿到旧数据
	const runningContextRef = useRef<TestRunContext>(runningContext);
	const setRunningContext = useCallback((next: TestRunContext) => {
		runningContextRef.current = next;
		setRunningContextState(next);
	}, []);
	// 手动取消sse流的方法
	const cancelStreamRef = useRef<null | (() => void)>(null);

	const currentRunContext = useMemo(() => {
		if (currentRunId === null) return initTestRunContext();
		const currentRun = runs.find(run => run.id === currentRunId);
		if (!currentRun) return initTestRunContext();
		if (currentRun.status === 'running') return runningContext;
		return {
			status: currentRun.status,
			currentStepIndex: -1,
			totalSteps: currentRun.totalSteps,
			vars: currentRun.finalVars,
			results: currentRun.stepResults,
			error: currentRun.error,
			startedAt: new Date(currentRun.startedAt).getTime(),
			endedAt: currentRun.endedAt === null ? null : new Date(currentRun.endedAt).getTime(),
		};
	}, [runs, currentRunId, runningContext]);

	// 刷新测试记录列表
	useEffect(() => {
		if (panelView !== 'run') return;
		let active = true;
		listTestFlowRuns(testFlowId)
			.then(runs => {
				if (!active) return;
				setRuns(runs);
			})
			.catch(error => {
				setSnackbar(`加载运行记录失败：${error instanceof Error ? error.message : String(error)}`);
				console.warn('加载运行记录失败：', error);
			});
		return () => {
			active = false;
		};
	}, [panelView, testFlowId, setSnackbar]);

	// 切换流程时重置运行状态
	const [prevTestFlowId, setPrevTestFlowId] = useState(testFlowId);
	if (prevTestFlowId !== testFlowId) {
		setPrevTestFlowId(testFlowId);
		setRuns([]);
		setCurrentRunId(null);
		setRunningContextState(initTestRunContext());
	}

	// 切换流程或卸载时断开sse流
	useEffect(() => {
		return () => {
			cancelStreamRef.current?.();
			cancelStreamRef.current = null;
			runningIdRef.current = null;
			isRunningRef.current = false;
			runningContextRef.current = initTestRunContext();
		};
	}, [testFlowId]);

	const runFlow = useCallback(async () => {
		if (isRunningRef.current) return;
		if (steps.length === 0) return;
		isRunningRef.current = true;

		const reset = () => {
			isRunningRef.current = false;
			runningIdRef.current = null;
			setRunningContext(initTestRunContext());
			cancelStreamRef.current = null;
		};

		try {
			const run = await startTestFlowRun(testFlowId);
			runningIdRef.current = run.id;
			//开始运行后创建新context追加到列表头，并设置为当前
			const context: TestRunContext = {
				...initTestRunContext(),
				status: 'running',
				totalSteps: steps.length,
				startedAt: Date.now(),
			};
			setRunningContext(context);
			setRuns(prev => [run, ...prev]);
			setCurrentRunId(run.id);
			cancelStreamRef.current = streamTestFlowRun(testFlowId, run.id, {
				onEvent: event => {
					setRunningContext({ ...runningContextRef.current, ...event.context });
				},
				onDone: async () => {
					reset();
					const result = await getTestFlowRun(testFlowId, run.id);
					setRuns(prev =>
						prev.map(prevRun => {
							if (prevRun.id !== run.id) return prevRun;
							return result;
						}),
					);
				},
				onError: async error => {
					reset();
					const result = await getTestFlowRun(testFlowId, run.id);
					setRuns(prev =>
						prev.map(prevRun => {
							if (prevRun.id !== run.id) return prevRun;
							return result;
						}),
					);
					setSnackbar(`测试出现错误\n运行ID: ${run.id}，错误: ${error instanceof Error ? error.message : String(error)}`);
					console.warn('测试流程运行失败：', error);
				},
			});
		} catch (error) {
			setSnackbar(`测试流程运行失败：${error instanceof Error ? error.message : String(error)}`);
			console.warn('测试流程运行失败：', error);
			reset();
		}
	}, [testFlowId, steps.length, setRunningContext, setSnackbar]);

	const stopFlow = useCallback(() => {
		const runId = runningIdRef.current;
		if (runId === null) return;
		// 只发停止请求，不断开SSE，服务端会推送执行状态
		void stopTestFlowRun(testFlowId, runId).catch(error => {
			setSnackbar(`停止测试流程失败：${error instanceof Error ? error.message : String(error)}`);
			console.warn('停止测试流程失败：', error);
		});
	}, [testFlowId, setSnackbar]);

	const contextValue = useMemo(
		() => ({
			runs,
			currentRunContext,
			currentRunId,
			setCurrentRunId,
			runFlow,
			stopFlow,
		}),
		[runs, currentRunContext, runFlow, stopFlow, currentRunId],
	);

	return <RunContext.Provider value={contextValue}>{children}</RunContext.Provider>;
};

