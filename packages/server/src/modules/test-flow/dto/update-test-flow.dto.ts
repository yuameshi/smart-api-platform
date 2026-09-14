import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { UpdateTestFlowRequest } from 'shared';

export class UpdateTestFlowDto implements UpdateTestFlowRequest {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name?: string;

	@IsOptional()
	@IsString()
	description?: string | null;
}
