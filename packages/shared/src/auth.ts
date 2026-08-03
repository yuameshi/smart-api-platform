import type { PublicUser } from './user';

/** 登录请求体 */
export type LoginRequest = {
	username: string;
	password: string;
};

/** 注册请求体 */
export type RegisterRequest = {
	username: string;
	email: string;
	password: string;
};

/** 登录注册统一响应 */
export type AuthResponse = {
	access_token: string;
	user: PublicUser;
};

/** JWT */
export type JwtPayload = {
	sub: number;
	username: string;
	isAdmin: boolean;
};
