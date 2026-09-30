import type { ExtractionRule, KeyValueEntry, RequestStepConfig, SendHttpRequestRequest, SentHttpResponse, VariableStore } from 'shared';
import { extractValueFromJson, jsonPathValueToString } from './jsonpath-extractor';
import { renderAuth, renderEntries, renderRequestBody, renderTemplate, writeVariable } from './variable-manager';

function applyPathParams(path: string, pathParams: KeyValueEntry[], variables: VariableStore): string {
	let result = path;
	for (const entry of renderEntries(pathParams, variables)) {
		if (!entry.active) continue;
		const key = entry.key.trim();
		if (key === '' || entry.value === '') continue;
		result = result.split(`{${key}}`).join(encodeURIComponent(entry.value));
	}
	return result;
}

// 获取所有会用于渲染的模板字符串
export function collectTemplates(config: RequestStepConfig): string[] {
	const templates: string[] = [config.path];
	for (const entry of [...config.pathParams, ...config.params, ...config.headers]) {
		templates.push(entry.value);
	}
	if (config.body.kind === 'raw') templates.push(config.body.raw);
	if (config.body.kind === 'formUrlEncoded') {
		for (const entry of config.body.entries) templates.push(entry.value);
	}
	if (config.auth.kind === 'bearer') templates.push(config.auth.token);
	if (config.auth.kind === 'basic') templates.push(config.auth.username, config.auth.password);
	for (const rule of config.extractions) templates.push(rule.jsonPath);
	return templates;
}

// 构建请求对象，渲染模板变量
export function buildHttpRequest(config: RequestStepConfig, projectId: number, variables: VariableStore): SendHttpRequestRequest {
	return {
		projectId,
		method: config.method,
		path: applyPathParams(config.path, config.pathParams, variables),
		params: renderEntries(config.params, variables),
		headers: renderEntries(config.headers, variables),
		body: renderRequestBody(config.body, variables),
		auth: renderAuth(config.auth, variables),
	};
}

// 减少body储存量，二进制不储存，截断长文本
export function shrinkResponseBody(response: SentHttpResponse): SentHttpResponse {
	if (!response.ok) return response;
	if (response.encoding === 'base64') return { ...response, body: '' };
	// 256k
	if (response.body.length > 256 * 1024) {
		return { ...response, body: response.body.slice(0, 256 * 1024) + '\n…[已截断]' };
	}
	return response;
}

export function parseResponseJson(response: SentHttpResponse | undefined): unknown {
	if (response === undefined || !response.ok) return undefined;
	if (response.encoding !== 'utf8') return undefined;
	try {
		return JSON.parse(response.body) as unknown;
	} catch {
		return undefined;
	}
}

type ExtractVarResult =
	| {
			ok: true;
			variableName: string;
			value: string;
	  }
	| {
			ok: false;
			variableName: string;
			reason: string;
	  };

// 提取单个变量
export function extractVariable(rule: ExtractionRule, json: unknown, variables: VariableStore): ExtractVarResult {
	const variableName = rule.variableName.trim();
	const path = renderTemplate(rule.jsonPath, variables);
	const defaultValue = rule.defaultValue?.trim() === '' ? undefined : rule.defaultValue;
	// json为undefined表示响应不是JSON
	const raw = json === undefined ? undefined : extractValueFromJson(json, path);
	if (raw === undefined) {
		if (defaultValue !== undefined)
			return {
				ok: true as const,
				variableName,
				value: defaultValue,
			};
		return {
			ok: false as const,
			variableName,
			reason:
				json === undefined
					? `响应不是JSON，无法提取：${path.trim() || '(整个响应体)'}`
					: `JSONPath无法取值：${path.trim() || '(整个响应体)'}`,
		};
	}
	return {
		ok: true as const,
		variableName,
		value: jsonPathValueToString(raw) ?? '',
	};
}

type BatchExtractResult =
	| {
			ok: true;
			extracted: { variableName: string; value: string }[];
			variables: VariableStore;
	  }
	| {
			ok: false;
			extracted: { variableName: string; value: string }[];
			variables: VariableStore;
			reason: string;
	  };

// 批量提取，错误直接终止
export function batchExtractVariables(rules: ExtractionRule[], json: unknown, variables: VariableStore): BatchExtractResult {
	const extracted: { variableName: string; value: string }[] = [];
	let nextVariablesMap = variables;
	for (const rule of rules) {
		if (!rule.enabled) continue;
		const result = extractVariable(rule, json, nextVariablesMap);
		if (!result.ok)
			return {
				ok: false,
				extracted,
				variables: nextVariablesMap,
				reason: result.reason,
			};
		nextVariablesMap = writeVariable(nextVariablesMap, {
			name: result.variableName,
			value: result.value,
		});
		if (result.variableName !== '')
			extracted.push({
				variableName: result.variableName,
				value: result.value,
			});
	}
	return {
		ok: true,
		extracted,
		variables: nextVariablesMap,
	};
}
