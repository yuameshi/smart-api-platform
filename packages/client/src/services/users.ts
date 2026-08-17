import type { CreateUserRequest, PublicUser, UpdateUserRequest } from 'shared';
import api from '@/services/api';

/** 获取用户列表 */
export async function listUsers(): Promise<PublicUser[]> {
	return (await api.get('/user')) as PublicUser[];
}

/** 创建用户 */
export async function createUser(data: CreateUserRequest): Promise<PublicUser> {
	return (await api.post('/user', data)) as PublicUser;
}

/** 更新用户 */
export async function updateUser(id: number, data: UpdateUserRequest): Promise<void> {
	await api.patch(`/user/${id}`, data);
}

/** 删除用户 */
export async function deleteUser(id: number): Promise<void> {
	await api.delete(`/user/${id}`);
}
