import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import type { UpdateFolderRequest } from 'shared';

export class UpdateFolderDto implements UpdateFolderRequest {
	@IsOptional()
	@IsString()
	@MaxLength(100)
	name?: string;

	// null表示移到根
	@IsOptional()
	@IsInt()
	parentId?: number | null;
}
