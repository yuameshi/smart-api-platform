import { registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';
import type { AssertStepConfig, ExtractionRule, KeyValueEntry, RequestStepConfig, TestStepConfig, TestStepType } from 'shared';
import { ASSERT_OPERATORS, HTTP_METHODS } from 'shared';

const isStr = (v: unknown): v is string => typeof v === 'string';
const isOptionalStr = (v: unknown): boolean => v === undefined || isStr(v);

// packages\server\src\modules\endpoint\dto\endpoint-validators.ts
function isKeyValueEntry(input: unknown): input is KeyValueEntry {
	if (typeof input !== 'object' || input === null) return false;
	const object = input as Record<string, unknown>;
	return (
		typeof object.key === 'string' &&
		typeof object.value === 'string' &&
		typeof object.active === 'boolean' &&
		(object.description === undefined || typeof object.description === 'string')
	);
}
// 判断是否为KV键值对数组
function isKeyValueEntryArray(value: unknown): value is KeyValueEntry[] {
	return Array.isArray(value) && value.every(isKeyValueEntry);
}
// 判断是否是请求步骤
export function isRequestStepConfig(value: unknown): value is RequestStepConfig {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
	const config = value as Record<string, unknown>;

	const isHttpMethod: boolean = isStr(config.method) && (HTTP_METHODS as readonly string[]).includes(config.method);

	// 判断body类型
	let isBodyValid: boolean = false;
	if (typeof config.body === 'object' && config.body !== null) {
		const body = config.body as Record<string, unknown>;
		switch (body.kind) {
			case 'none':
				isBodyValid = true;
				break;
			case 'raw':
				isBodyValid = body.contentType === 'application/json' && isStr(body.raw);
				break;
			case 'formUrlEncoded':
				isBodyValid = isKeyValueEntryArray(body.entries);
				break;
			default:
				isBodyValid = false;
		}
	}

	// 判断认证类型
	let isAuthValid: boolean = false;
	if (typeof config.auth === 'object' && config.auth !== null) {
		const auth = config.auth as Record<string, unknown>;
		switch (auth.kind) {
			case 'none':
				isAuthValid = true;
				break;
			case 'bearer':
				isAuthValid = isStr(auth.token);
				break;
			case 'basic':
				isAuthValid = isStr(auth.username) && isStr(auth.password);
				break;
			default:
				isAuthValid = false;
		}
	}

	return (
		isHttpMethod &&
		isStr(config.path) &&
		config.path.length <= 2048 &&
		isKeyValueEntryArray(config.pathParams) &&
		isKeyValueEntryArray(config.params) &&
		isKeyValueEntryArray(config.headers) &&
		isBodyValid &&
		isAuthValid &&
		Array.isArray(config.extractions) &&
		config.extractions.every((rule: unknown): rule is ExtractionRule => {
			// 判断是否为变量提取数组
			if (typeof rule !== 'object' || rule === null || Array.isArray(rule)) return false;
			const r = rule as Record<string, unknown>;
			return isStr(r.variableName) && isStr(r.jsonPath) && isOptionalStr(r.defaultValue) && typeof r.enabled === 'boolean';
		})
	);
}
export function isAssertStepConfig(value: unknown): value is AssertStepConfig {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
	const config = value as Record<string, unknown>;

	// 判断断言的左值
	let isLeftValid = false;
	if (typeof config.left === 'object' && config.left !== null) {
		const left = config.left as Record<string, unknown>;
		if (['variable', 'jsonpath', 'literal'].includes(left.mode as string) === false) {
			isLeftValid = false;
		} else {
			isLeftValid = isStr(left.value);
		}
	}

	// 判断是不是预设好的断言操作符
	const isOperatorValid = isStr(config.operator) && (ASSERT_OPERATORS as readonly string[]).includes(config.operator);

	return isLeftValid && isOperatorValid && isStr(config.expected);
}

// 判断config是否与步骤类型匹配
export function isStepConfigForType(type: TestStepType | undefined, config: unknown): config is TestStepConfig {
	if (type === 'request') return isRequestStepConfig(config);
	if (type === 'assert') return isAssertStepConfig(config);
	return false;
}

// dto校验注解
export function IsTestStepConfig(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isTestStepConfig',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: unknown, args: ValidationArguments) {
					const type = (args.object as { type?: TestStepType }).type;
					// 更新请求不带type时先通过，后续让service判断
					if (type === undefined) return isRequestStepConfig(value) || isAssertStepConfig(value);
					return isStepConfigForType(type, value);
				},
				defaultMessage() {
					return '步骤配置和类型不匹配';
				},
			},
		});
	};
}
