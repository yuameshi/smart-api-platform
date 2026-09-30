import { EventSourcePolyfill } from 'event-source-polyfill';
import type { TestFlowRun, TestRunEvent } from 'shared';
import api, { getAuthToken } from '@/services/api';
import { API_BASE_URL } from '@/constants/config';

export async function startTestFlowRun(flowId: number): Promise<TestFlowRun> {
	return (await api.post(`/test-flow/${flowId}/runs`)) as TestFlowRun;
}

export async function listTestFlowRuns(flowId: number): Promise<TestFlowRun[]> {
	return (await api.get(`/test-flow/${flowId}/runs`)) as TestFlowRun[];
}

export async function getTestFlowRun(flowId: number, runId: number): Promise<TestFlowRun> {
	return (await api.get(`/test-flow/${flowId}/runs/${runId}`)) as TestFlowRun;
}

export async function stopTestFlowRun(flowId: number, runId: number): Promise<void> {
	await api.post(`/test-flow/${flowId}/runs/${runId}/stop`);
}

type StreamRunHandlers = {
	onEvent: (event: TestRunEvent) => void;
	onDone?: () => void;
	// 测试失败走onEvent
	onError?: (error: Error) => void;
};

//用sse流式传输运行进度，用第三方polyfill是因为原生的不支持携带请求头，返回断开连接的方法（不终止运行）
export function streamTestFlowRun(flowId: number, runId: number, handlers: StreamRunHandlers): () => void {
	const token = getAuthToken();
	const source = new EventSourcePolyfill(`${API_BASE_URL}/test-flow/${flowId}/runs/${runId}/stream`, {
		headers: token ? { Authorization: `Bearer ${token}` } : {},
	});

	// 避免手动关闭触发onerr
	let manuallyClosed = false;

	source.onmessage = message => {
		try {
			const event = JSON.parse(message.data) as TestRunEvent;
			handlers.onEvent(event);
			if (event.context.status !== 'running') {
				close();
				handlers.onDone?.();
			}
		} catch (e) {
			console.warn('解析运行事件失败', e, message.data);
		}
	};

	source.onerror = () => {
		if (manuallyClosed) return;
		close();
		handlers.onError?.(new Error('连接中断'));
	};

	const close = () => {
		manuallyClosed = true;
		source.close();
	};

	return close;
}
