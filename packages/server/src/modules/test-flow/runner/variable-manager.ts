import type { AuthConfig, KeyValueEntry, RequestBody, VariableStore } from 'shared';

// 写入单个变量，操作后返回新表
export function writeVariable(
	store: VariableStore,
	newVar: {
		name: string;
		value: string;
	},
): VariableStore {
	const key = newVar.name.trim();
	if (key === '') return store;
	return { ...store, [key]: newVar.value };
}

// {{var}}模板匹配规则
const VAR_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;

// 渲染模板字符串，替换{{var}}，找不到的不替换
export function renderTemplate(input: string, variables: VariableStore): string {
	const result = input.replace(VAR_PATTERN, (matched, rawName: string) => {
		const name = rawName.trim();
		// 用hasOwnProperty防止读取到原型链上的键
		if (!Object.prototype.hasOwnProperty.call(variables, name)) return matched;
		return variables[name];
	});

	return result;
}

// 检查模板字符串中是否有未定义的变量，返回未定义变量名列表
export function findMissingVariables(templates: string[], variables: VariableStore): string[] {
	const missing = new Set<string>();
	for (const template of templates) {
		for (const match of template.matchAll(VAR_PATTERN)) {
			const name = match[1].trim();
			if (!Object.prototype.hasOwnProperty.call(variables, name)) missing.add(name);
		}
	}
	return [...missing];
}

//渲染键值对的value
export function renderEntries(entries: KeyValueEntry[], variables: VariableStore): KeyValueEntry[] {
	return entries.map(entry => ({
		...entry,
		value: renderTemplate(entry.value, variables),
	}));
}

export function renderRequestBody(body: RequestBody, variables: VariableStore): RequestBody {
	if (body.kind === 'raw')
		return {
			...body,
			raw: renderTemplate(body.raw, variables),
		};
	if (body.kind === 'formUrlEncoded')
		return {
			...body,
			entries: renderEntries(body.entries, variables),
		};
	return body;
}

export function renderAuth(auth: AuthConfig, variables: VariableStore): AuthConfig {
	if (auth.kind === 'bearer')
		return {
			...auth,
			token: renderTemplate(auth.token, variables),
		};
	if (auth.kind === 'basic')
		return {
			...auth,
			username: renderTemplate(auth.username, variables),
			password: renderTemplate(auth.password, variables),
		};
	return auth;
}
