import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CreateTestFlowRequest } from 'shared';

export class CreateTestFlowDto implements CreateTestFlowRequest {
	@IsInt()
	projectId!: number;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;

	@IsOptional()
	@IsString()
	description?: string;
}
