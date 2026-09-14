import type { CreateTestFlowRequest, TestFlow, UpdateTestFlowRequest } from 'shared';

const date = new Date().toISOString();
const flows: TestFlow[] = ['123', '321', '1234567'].map(a => ({
	id: Math.round(Math.random() * 1000),
	projectId: 5,
	name: a,
	description: null,
	createdAt: date,
	updatedAt: date,
}));

export async function listTestFlows(projectId: number): Promise<TestFlow[]> {
	return flows.map(flow => ({ ...flow, projectId }));
}

export async function getTestFlow(id: number): Promise<TestFlow> {
	const flow = flows[1];
	if (!flow) {
		throw new Error('测试流程不存在');
	}
	return flow;
}

export async function createTestFlow(data: CreateTestFlowRequest): Promise<TestFlow> {
	const now = new Date().toISOString();
	return {
		id: Math.round(Math.random() * 1000),
		projectId: data.projectId,
		name: data.name,
		description: data.description ?? null,
		createdAt: now,
		updatedAt: now,
	};
}

export async function updateTestFlow(id: number, data: UpdateTestFlowRequest): Promise<void> {
	return;
}

export async function deleteTestFlow(id: number): Promise<void> {
	return;
}
