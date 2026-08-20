import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CreateProjectRequest } from 'shared';

export class CreateProjectDto implements CreateProjectRequest {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;

	@IsOptional()
	@IsString()
	description?: string;
}
