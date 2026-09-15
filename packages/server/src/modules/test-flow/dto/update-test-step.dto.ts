import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { TestStepConfig, TestStepType, UpdateTestStepRequest } from 'shared';
import { IsTestStepConfig } from './test-step-validators';
import { TEST_STEP_TYPE } from 'shared';

export class UpdateTestStepDto implements UpdateTestStepRequest {
	@IsOptional()
	@IsIn(TEST_STEP_TYPE)
	type?: TestStepType;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name?: string;

	@IsOptional()
	@IsTestStepConfig()
	config?: TestStepConfig;
}
