import type { CreateTestStepRequest, TestStep, UpdateTestStepRequest } from 'shared';
import api from '@/services/api';

export async function listTestSteps(flowId: number): Promise<TestStep[]> {
	return (await api.get(`/test-flow/${flowId}/steps`)) as TestStep[];
}

export async function getTestStep(flowId: number, stepId: number): Promise<TestStep> {
	return (await api.get(`/test-flow/${flowId}/steps/${stepId}`)) as TestStep;
}

export async function createTestStep(flowId: number, data: CreateTestStepRequest): Promise<TestStep> {
	return (await api.post(`/test-flow/${flowId}/steps`, data)) as TestStep;
}

export async function updateTestStep(flowId: number, stepId: number, data: UpdateTestStepRequest): Promise<void> {
	await api.patch(`/test-flow/${flowId}/steps/${stepId}`, data);
}

export async function deleteTestStep(flowId: number, stepId: number): Promise<void> {
	await api.delete(`/test-flow/${flowId}/steps/${stepId}`);
}

export async function reorderTestSteps(flowId: number, orderedIds: number[]): Promise<void> {
	await api.patch(`/test-flow/${flowId}/steps/reorder`, { orderedIds });
}
