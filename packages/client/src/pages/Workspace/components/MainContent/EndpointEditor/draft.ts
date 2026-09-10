import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';
import type { ApiEndpoint, AuthConfig, HttpMethod, KeyValueEntry, RequestBody, SentHttpResponse } from 'shared';

export type EndpointDraft = {
	endpointId: number;
	initialized: boolean; // 检测是否初始化过
	// 端点数据
	method: HttpMethod;
	path: string; // URL，不含search params
	params: KeyValueEntry[];
	headers: KeyValueEntry[];
	// 转格式，避免频繁对数组进行find
	pathParamEntries: Record<string, Omit<KeyValueEntry, 'key'>>;
	body: RequestBody;
	auth: AuthConfig;
	// 记录响应数据
	sending: boolean;
	response: SentHttpResponse | null;
};

export const draftFamily = atomFamily((endpointId: number) =>
	atom<EndpointDraft>({
		endpointId,
		initialized: false,
		method: 'GET',
		path: '',
		params: [],
		headers: [],
		pathParamEntries: {},
		body: { kind: 'none' },
		auth: { kind: 'none' },
		sending: false,
		response: null,
	}),
);

export const freeDirtyEndpoint = draftFamily.remove;

// ApiEndpoint数据转draft
export function draftFromEndpoint(e: ApiEndpoint): EndpointDraft {
	return {
		endpointId: e.id,
		initialized: true,
		method: e.method,
		path: e.path,
		params: (e.queryParams ?? []) as KeyValueEntry[],
		headers: (e.headers ?? []) as KeyValueEntry[],
		pathParamEntries: Object.fromEntries(
			(e.pathParams ?? []).map(param => [
				param.key,
				{
					value: param.value,
					active: param.active,
					...(param.description !== undefined ? { description: param.description } : {}),
				},
			]),
		),
		body: e.requestBody ?? { kind: 'none' },
		auth: e.auth ?? { kind: 'none' },
		sending: false,
		response: null,
	};
}

export const stringifyDraft = (draft: EndpointDraft) =>
	JSON.stringify(
		(
			[
				// 只导出会保存的key
				'method',
				'path',
				'params',
				'headers',
				'pathParamEntries',
				'body',
				'auth',
			] as const
		).map(key => draft[key]),
	);

// 从URL提取路径参数
export const getPathParams = (url: string) => [...new Set([...url.matchAll(/\{([^{}]+)\}/g)].map(m => m[1]))];
