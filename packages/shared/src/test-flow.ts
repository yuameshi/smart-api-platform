import type { HttpMethod } from './api-endpoint';
import type { AuthConfig, KeyValueEntry, RequestBody } from './http-request';

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

/** 提取变量规则 */
export type ExtractionRule = {
	variableName: string;
	jsonPath: string;
	defaultValue?: string;
	enabled: boolean;
};

/** 请求步骤配置 */
export type RequestStepConfig = {
	method: HttpMethod;
	path: string;
	pathParams: KeyValueEntry[];
	params: KeyValueEntry[];
	headers: KeyValueEntry[];
	body: RequestBody;
	auth: AuthConfig;
	extractions: ExtractionRule[];
};

/** 断言左值取值来源 */
export type AssertLeft = {
	mode:
		// 提取的变量
		| 'variable'
		// 上次请求返回JSON的值
		| 'jsonpath'
		// 常量
		| 'literal';
	value: string;
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

/** 断言配置 */
export type AssertStepConfig = {
	left: AssertLeft;
	operator: AssertOperator;
	expected: string;
};

/** 步骤排序请求体 */
export type ReorderTestStepsRequest = {
	orderedIds: number[]; // 步骤id顺序（[stepId1, stepId2, stepId3...])
};

/** 步骤配置 */
export type TestStepConfig = RequestStepConfig | AssertStepConfig;

/** 测试步骤类型 */
export type TestStepBase = {
	id: number;
	testFlowId: number;
	order: number;
	name: string;
	createdAt: string;
	updatedAt: string;
};

export type TestStep =
	| (TestStepBase & {
			type: 'assert';
			config: AssertStepConfig;
	  })
	| (TestStepBase & {
			type: 'request';
			config: RequestStepConfig;
	  });

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
