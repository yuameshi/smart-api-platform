import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { EditApiEndpointMetaRequest } from 'shared';

export class EditEndpointMetaDto implements EditApiEndpointMetaRequest {
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
	@IsInt()
	folderId?: number | null;
}
