import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { CreateTestStepRequest, TestStepConfig, TestStepType } from 'shared';
import { TEST_STEP_TYPE } from 'shared';
import { IsTestStepConfig } from './test-step-validators';

export class CreateTestStepDto implements CreateTestStepRequest {
	@IsIn(TEST_STEP_TYPE)
	type!: TestStepType;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;

	@IsTestStepConfig()
	config!: TestStepConfig;
}
