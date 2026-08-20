/** 文件夹 */
export type Folder = {
	id: number;
	projectId: number;
	parentId: number | null;
	name: string;
	createdAt: string;
	updatedAt: string;
};

/** 创建文件夹请求体 */
export type CreateFolderRequest = {
	projectId: number;
	parentId?: number;
	name: string;
};

/** 更新文件夹请求体（parentId传null表示移到项目根） */
export type UpdateFolderRequest = {
	name?: string;
	parentId?: number | null;
};
