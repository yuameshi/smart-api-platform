/** 统一 API 响应格式 */
interface ApiResponse<T> {
	code: number;
	data: T;
	message: string;
}

/** 登录接口响应 */
interface LoginResponse {
	access_token: string;
	user: UserBrief;
}

/** 注册接口响应 */
interface RegisterResponse {
	access_token: string;
	user: UserBrief;
}
