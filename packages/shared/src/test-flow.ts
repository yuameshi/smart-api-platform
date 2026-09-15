import type { HttpMethod } from './api-endpoint';

/** 测试流程 */
export type TestFlow = {
	id: number;
	projectId: number;
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
};

/** 创建测试流程请求体 */
export type CreateTestFlowRequest = {
	projectId: number;
	name: string;
	description?: string;
};

/** 更新测试流程请求体 */
export type UpdateTestFlowRequest = {
	name?: string;
	description?: string | null;
};

/** 测试步骤类型 */
export const TEST_STEP_TYPE = ['request', 'assert'] as const;
export type TestStepType = (typeof TEST_STEP_TYPE)[number];

/** placeholder请求步骤配置 */
export type RequestStepConfig = {
	method: HttpMethod;
	path: string;
};

/** 断言操作符 */
export const ASSERT_OPERATORS = [
	'eq',
	'neq',
	'contains',
	'notContains',
	'exists',
	'notExists',
	'matches',
	'notMatches',
	'gt',
	'gte',
	'lt',
	'lte',
	'isJson',
	'isNumber',
	'isEmpty',
] as const;
export type AssertOperator = (typeof ASSERT_OPERATORS)[number];

/** placeholder断言步骤配置 */
export type AssertStepConfig = {
	operator: AssertOperator;
	expected: string;
};

/** 步骤配置 */
export type TestStepConfig = RequestStepConfig | AssertStepConfig;

/** 测试步骤类型 */
export type TestStep = {
	id: number;
	testFlowId: number;
	order: number;
	type: TestStepType;
	name: string;
	config: TestStepConfig;
	createdAt: string;
	updatedAt: string;
};

/** 创建测试步骤请求体 */
export type CreateTestStepRequest = {
	type: TestStepType;
	name: string;
	config: TestStepConfig;
};

/** 更新测试步骤请求体 */
export type UpdateTestStepRequest = {
	type?: TestStepType;
	name?: string;
	config?: TestStepConfig;
};
