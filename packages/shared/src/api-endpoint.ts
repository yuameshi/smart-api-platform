// 这个文件夹存放的是系统存储API端点的各种类型，不是接口请求和响应的类型

import type { AuthConfig, KeyValueEntry, RequestBody } from './http-request';

/** HTTP方法列表 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** 端点响应示例 */
export type ResponseExample = {
	statusCode: number;
	description?: string;
	schema?: unknown;
	example?: unknown;
};

/** API端点类型 */
export type ApiEndpoint = {
	id: number;
	projectId: number;
	folderId: number | null;
	method: HttpMethod;
	path: string;
	summary: string;
	description: string | null;
	tags: string[] | null;
	pathParams: KeyValueEntry[] | null;
	queryParams: KeyValueEntry[] | null;
	headers: KeyValueEntry[] | null;
	requestBody: RequestBody | null;
	auth: AuthConfig | null;
	responses: ResponseExample[] | null;
	createdAt: string;
	updatedAt: string;
};

/** 创建API端点请求体 */
export type CreateApiEndpointRequest = {
	projectId: number;
	folderId?: number | null;
	path: string;
	summary: string;
};

/** 修改API端点信息请求体 */
export type EditApiEndpointMetaRequest = {
	path?: string;
	summary?: string;
	folderId?: number | null;
};

/** 完整更新端点请求体 */
export type UpdateApiEndpointContentRequest = {
	method?: HttpMethod;
	path?: string;
	summary?: string;
	description?: string;
	pathParams?: KeyValueEntry[] | null;
	queryParams?: KeyValueEntry[] | null;
	headers?: KeyValueEntry[] | null;
	requestBody?: RequestBody | null;
	auth?: AuthConfig | null;
};
