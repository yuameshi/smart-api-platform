/** JWT 用户简要信息 */
interface UserBrief {
	id: number;
	username: string;
	email: string;
	isAdmin: boolean;
	isActive: boolean;
}
