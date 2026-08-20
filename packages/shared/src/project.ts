/** 项目 */
export type Project = {
	id: number;
	name: string;
	description: string | null;
	ownerId: number;
	createdAt: string;
	updatedAt: string;
};

/** 创建项目请求体 */
export type CreateProjectRequest = {
	name: string;
	description?: string;
};

/** 更新项目请求体 */
export type UpdateProjectRequest = {
	name?: string;
	description?: string;
};
