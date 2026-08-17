/** 公开的用户信息 */
export type PublicUser = {
	id: number;
	username: string;
	email: string;
	isAdmin: boolean;
	isActive: boolean;
	createdAt: string;
};

/** 创建用户请求体 */
export type CreateUserRequest = {
	username: string;
	email: string;
	password: string;
	isAdmin?: boolean;
	isActive?: boolean;
};

/** 更新用户请求体 */
export type UpdateUserRequest = {
	username?: string;
	email?: string;
	password?: string;
	isAdmin?: boolean;
	isActive?: boolean;
};

/** 用户自助修改个人设置请求体 */
export type UpdateProfileRequest = {
	username?: string;
	email?: string;
	password?: string;
};
