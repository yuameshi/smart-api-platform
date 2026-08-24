import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CreateFolderRequest } from 'shared';

export class CreateFolderDto implements CreateFolderRequest {
	@IsInt()
	projectId!: number;

	@IsOptional()
	@IsInt()
	parentId?: number;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;
}
