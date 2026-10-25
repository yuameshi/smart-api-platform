import type { ProjectService } from '@/modules/project/project.service';
import type { EndpointService } from '@/modules/endpoint/endpoint.service';
import type { TestFlowService } from '@/modules/test-flow/test-flow.service';

// 工具执行上下文，传服务实例
export type AiToolContext = {
	projectId: number;
	userId: number;
	isAdmin: boolean;
	sessionId: string;
	selectedTestFlowId?: number;
	services: {
		projectService: ProjectService;
		endpointService: EndpointService;
		testFlowService: TestFlowService;
	};
};

// 工具调用统一返回值结构
export type AiToolOk<T extends Record<string, unknown>> = T & {
	ok: true;
};
export type AiToolFail = {
	ok: false;
	error: string;
};

// 捕获业务异常，其他错误往上抛
export async function executeSafely<T>(fn: () => Promise<T>): Promise<T | AiToolFail> {
	try {
		return await fn();
	} catch (error) {
		// 只捕获带getStatus的Nest Exception
		if (error instanceof Error && typeof (error as { getStatus?: unknown }).getStatus === 'function') {
			return {
				ok: false,
				error: error.message,
			};
		}
		throw error;
	}
}
