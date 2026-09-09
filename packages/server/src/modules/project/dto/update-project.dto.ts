import { IsOptional, IsString, MaxLength } from 'class-validator';
import type { UpdateProjectRequest } from 'shared';

export class UpdateProjectDto implements UpdateProjectRequest {
	@IsOptional()
	@IsString()
	@MaxLength(100)
	name?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	baseUrl?: string | null;
}
