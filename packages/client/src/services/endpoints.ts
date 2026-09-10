import type { ApiEndpoint, CreateApiEndpointRequest, EditApiEndpointMetaRequest, UpdateApiEndpointContentRequest } from 'shared';
import api from '@/services/api';

export async function listEndpoints(projectId: number, folderId?: number): Promise<ApiEndpoint[]> {
	return (await api.get('/endpoint', { params: { projectId, folderId } })) as ApiEndpoint[];
}

export async function getEndpoint(id: number): Promise<ApiEndpoint> {
	return (await api.get(`/endpoint/${id}`)) as ApiEndpoint;
}

export async function createEndpoint(data: CreateApiEndpointRequest): Promise<ApiEndpoint> {
	return (await api.post('/endpoint', data)) as ApiEndpoint;
}

export async function editEndpointMeta(id: number, data: EditApiEndpointMetaRequest): Promise<void> {
	await api.patch(`/endpoint/${id}/meta`, data);
}

// todo
export async function updateEndpointContent(id: number, data: UpdateApiEndpointContentRequest): Promise<void> {
	console.log(`[updateEndpointContent] id=${id}`, JSON.stringify(data, null, 2));
}

export async function deleteEndpoint(id: number): Promise<void> {
	await api.delete(`/endpoint/${id}`);
}
