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
