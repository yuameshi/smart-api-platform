import type { CreateFolderRequest, Folder, UpdateFolderRequest } from 'shared';
import api from '@/services/api';

export async function listFolders(projectId: number): Promise<Folder[]> {
	return (await api.get('/folder', { params: { projectId } })) as Folder[];
}

export async function createFolder(data: CreateFolderRequest): Promise<Folder> {
	return (await api.post('/folder', data)) as Folder;
}

export async function updateFolder(id: number, data: UpdateFolderRequest): Promise<void> {
	await api.patch(`/folder/${id}`, data);
}

export async function deleteFolder(id: number): Promise<void> {
	await api.delete(`/folder/${id}`);
}
