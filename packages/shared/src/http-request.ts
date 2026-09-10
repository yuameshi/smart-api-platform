import type { HttpMethod } from './api-endpoint';

/** 通用键值对：Query 参数 / 请求头 / 路径参数 */
export type KeyValueEntry = {
	key: string;
	value: string;
	active: boolean; // 是否激活（是否参与本次请求）
	description?: string;
};

/** 请求体类型 */
export type RequestBody =
	| { kind: 'none' }
	| { kind: 'raw'; contentType: 'application/json'; raw: string }
	| { kind: 'formUrlEncoded'; entries: KeyValueEntry[] };

/** 认证配置 */
export type AuthConfig =
	| { kind: 'none' }
	| { kind: 'bearer'; token: string }
	| {
			kind: 'basic';
			username: string;
			password: string;
	  };

/** 代发请求体 */
export type SendHttpRequestRequest = {
	projectId: number; // 获取baseUrl用
	method: HttpMethod;
	path: string; // path param让前端替换
	params: KeyValueEntry[]; // 后端只发active的
	headers: KeyValueEntry[];
	body: RequestBody;
	auth: AuthConfig;
};

/** 网络失败（不包含4xx/5xx） */
export type SentHttpError = {
	kind: 'timeout' | 'invalid-url' | 'unknown';
	message: string;
};

/** 代发结果 */
export type SentHttpResponse =
	| {
			ok: true;
			status: number;
			statusText: string;
			headers: { key: string; value: string }[]; // 数组保留重复字段
			body: string;
			encoding: 'utf8' | 'base64'; // 文本utf8，二进制base64
			contentType: string | null;
			durationMs: number;
			sizeBytes: number; // 返回大小
	  }
	| { ok: false; error: SentHttpError };
