import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import type { KeyValueEntry } from 'shared';

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

export function IsKeyValueEntryArray(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isKeyValueEntryArray',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: unknown) {
					return Array.isArray(value) && value.every(isKeyValueEntry);
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property}的每项必须为KeyValueEntry类型`;
				},
			},
		});
	};
}

export function IsRequestBody(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isRequestBody',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: unknown) {
					if (typeof value !== 'object' || value === null) return false;
					const body = value as Record<string, unknown>;
					if (body.kind === 'none') return true;
					if (body.kind === 'raw') return body.contentType === 'application/json' && typeof body.raw === 'string';
					if (body.kind === 'formUrlEncoded') return Array.isArray(body.entries) && body.entries.every(isKeyValueEntry);
					return false;
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property}不是合法的RequestBody`;
				},
			},
		});
	};
}

export function IsAuthConfig(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isAuthConfig',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: unknown) {
					if (typeof value !== 'object' || value === null) return false;
					const authConfig = value as Record<string, unknown>;
					if (authConfig.kind === 'none') return true;
					if (authConfig.kind === 'bearer') return typeof authConfig.token === 'string';
					if (authConfig.kind === 'basic')
						return typeof authConfig.username === 'string' && typeof authConfig.password === 'string';
					return false;
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property}不是合法的AuthConfig`;
				},
			},
		});
	};
}
