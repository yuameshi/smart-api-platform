// 这个文件夹存放的是系统存储API端点的各种类型，不是接口请求和响应的类型

/** HTTP方法列表 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** 路径参数 */
export type PathParam = {
	name: string;
	description?: string;
	required?: boolean;
	type?: string;
};

/** 端点查询参数 */
export type QueryParam = {
	name: string;
	description?: string;
	required?: boolean;
	type?: string;
	example?: string;
};

/** 端点请求头参数 */
export type HeaderParam = {
	key: string;
	value?: string;
	description?: string;
	required?: boolean;
};

/** 端点请求体 */
export type RequestBody = {
	contentType?: string;
	raw?: string;
	schema?: unknown;
};

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
	pathParams: PathParam[] | null;
	queryParams: QueryParam[] | null;
	headers: HeaderParam[] | null;
	requestBody: RequestBody | null;
	responses: ResponseExample[] | null;
	version: string | null;
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
