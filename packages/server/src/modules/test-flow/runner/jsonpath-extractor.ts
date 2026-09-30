import { JSONPath, type JSONPathOptions } from 'jsonpath-plus';

// 取值
export function extractValueFromJson(json: unknown, path: string): unknown {
	if (json === undefined) return undefined;
	const realPath = path.trim();
	// 路径留空取整个响应体
	if (realPath === '') return json;
	try {
		const matched = JSONPath({
			path: realPath,
			json: json as JSONPathOptions['json'],
			wrap: true,
			eval: 'safe',
		}) as unknown[];
		return matched.length > 0 ? matched[0] : undefined;
	} catch {
		return undefined;
	}
}

// 转成字符串方便存和对比
export function jsonPathValueToString(value: unknown): string | undefined {
	if (value === undefined) return undefined;
	if (typeof value === 'string') return value;
	if (typeof value === 'object' && value !== null) return JSON.stringify(value);
	return String(value);
}
