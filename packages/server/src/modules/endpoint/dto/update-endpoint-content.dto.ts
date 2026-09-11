import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { AuthConfig, HttpMethod, KeyValueEntry, RequestBody, UpdateApiEndpointContentRequest } from 'shared';
import { IsAuthConfig, IsKeyValueEntryArray, IsRequestBody } from './endpoint-validators';

export class UpdateEndpointContentDto implements UpdateApiEndpointContentRequest {
	@IsOptional()
	@IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
	method?: HttpMethod;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	path?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	summary?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsKeyValueEntryArray()
	pathParams?: KeyValueEntry[] | null;

	@IsOptional()
	@IsKeyValueEntryArray()
	queryParams?: KeyValueEntry[] | null;

	@IsOptional()
	@IsKeyValueEntryArray()
	headers?: KeyValueEntry[] | null;

	@IsOptional()
	@IsRequestBody()
	requestBody?: RequestBody | null;

	@IsOptional()
	@IsAuthConfig()
	auth?: AuthConfig | null;
}
