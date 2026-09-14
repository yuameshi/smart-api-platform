import type { CreateTestFlowRequest, TestFlow, UpdateTestFlowRequest } from 'shared';
import api from '@/services/api';

export async function listTestFlows(projectId: number): Promise<TestFlow[]> {
	return (await api.get('/test-flow', { params: { projectId } })) as TestFlow[];
}

export async function getTestFlow(id: number): Promise<TestFlow> {
	return (await api.get(`/test-flow/${id}`)) as TestFlow;
}

export async function createTestFlow(data: CreateTestFlowRequest): Promise<TestFlow> {
	return (await api.post('/test-flow', data)) as TestFlow;
}

export async function updateTestFlow(id: number, data: UpdateTestFlowRequest): Promise<void> {
	await api.patch(`/test-flow/${id}`, data);
}

export async function deleteTestFlow(id: number): Promise<void> {
	await api.delete(`/test-flow/${id}`);
}
