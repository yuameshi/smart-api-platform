import type { CreateProjectRequest, Project, UpdateProjectRequest } from 'shared';
import api from '@/services/api';

export async function listProjects(): Promise<Project[]> {
	return (await api.get('/project')) as Project[];
}

export async function getProject(id: number): Promise<Project> {
	return (await api.get(`/project/${id}`)) as Project;
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
	return (await api.post('/project', data)) as Project;
}

export async function updateProject(id: number, data: UpdateProjectRequest): Promise<void> {
	await api.patch(`/project/${id}`, data);
}

export async function deleteProject(id: number): Promise<void> {
	await api.delete(`/project/${id}`);
}
