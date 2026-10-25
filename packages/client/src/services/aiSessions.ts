import type { AiSessionDetail, AiSessionSummary } from 'shared';
import api from '@/services/api';

// AI会话管理api

export async function listAiSessions(projectId: number): Promise<AiSessionSummary[]> {
	return (await api.get('/ai/session', { params: { projectId } })) as AiSessionSummary[];
}

export async function getAiSession(id: string): Promise<AiSessionDetail> {
	return (await api.get(`/ai/session/${id}`)) as AiSessionDetail;
}

export async function createAiSession(projectId: number): Promise<AiSessionSummary> {
	return (await api.post('/ai/session', { projectId })) as AiSessionSummary;
}

export async function deleteAiSession(id: string): Promise<void> {
	await api.delete(`/ai/session/${id}`);
}
