import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CreateApiEndpointRequest } from 'shared';

export class CreateEndpointDto implements CreateApiEndpointRequest {
	@IsInt()
	projectId!: number;

	@IsOptional()
	@IsInt()
	folderId?: number | null;

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	path!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	summary!: string;
}
