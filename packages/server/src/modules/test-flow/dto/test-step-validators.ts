import { registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';
import type { AssertStepConfig, RequestStepConfig, TestStepConfig, TestStepType } from 'shared';
import { ASSERT_OPERATORS, HTTP_METHODS } from 'shared';

const REQUEST_KEYS = ['method', 'path'];
const ASSERT_KEYS = ['operator', 'expected'];

const isObjectWithKeys = (value: unknown, allowed: readonly string[]): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).every(key => allowed.includes(key));

function isRequestStepConfig(value: unknown): value is RequestStepConfig {
	if (!isObjectWithKeys(value, REQUEST_KEYS)) return false;
	return (
		typeof value.method === 'string' &&
		(HTTP_METHODS as readonly string[]).includes(value.method) &&
		typeof value.path === 'string' &&
		value.path.length <= 2048
	);
}

function isAssertStepConfig(value: unknown): value is AssertStepConfig {
	if (!isObjectWithKeys(value, ASSERT_KEYS)) return false;
	return (
		typeof value.operator === 'string' &&
		(ASSERT_OPERATORS as unknown as string[]).includes(value.operator) &&
		typeof value.expected === 'string'
	);
}

// 判断config是否与步骤类型匹配
export function isStepConfigForType(type: string | undefined, config: unknown): config is TestStepConfig {
	if (type === 'request') return isRequestStepConfig(config);
	if (type === 'assert') return isAssertStepConfig(config);
	return false;
}

// 在DTO校验config与是否和同级的type匹配
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
