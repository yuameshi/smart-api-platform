import { IsIn, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { AuthConfig, HttpMethod, KeyValueEntry, RequestBody, SendHttpRequestRequest } from 'shared';
import { IsAuthConfig, IsKeyValueEntryArray, IsRequestBody } from '../../endpoint/dto/endpoint-validators';

export class SendHttpRequestDto implements SendHttpRequestRequest {
	@IsInt()
	projectId!: number;

	@IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
	method!: HttpMethod;

	@IsString()
	@IsNotEmpty()
	@MaxLength(2048)
	path!: string;

	@IsKeyValueEntryArray()
	params!: KeyValueEntry[];

	@IsKeyValueEntryArray()
	headers!: KeyValueEntry[];

	@IsRequestBody()
	body!: RequestBody;

	@IsAuthConfig()
	auth!: AuthConfig;
}
