import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CreateAiSessionRequest } from 'shared';

export class CreateAiSessionDto implements CreateAiSessionRequest {
	@IsInt()
	projectId!: number;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	title?: string;
}
