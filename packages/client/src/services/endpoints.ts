import type { ApiEndpoint, CreateApiEndpointRequest, EditApiEndpointMetaRequest } from 'shared';
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

export async function deleteEndpoint(id: number): Promise<void> {
	await api.delete(`/endpoint/${id}`);
}
