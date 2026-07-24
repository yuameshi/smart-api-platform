import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * 认证服务
 *
 * 提供用户注册、登录、JWT 令牌生成与密码验证等认证逻辑。
 */
@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * 用户注册
	 * 检查用户名/邮箱唯一性，对密码进行 bcrypt 哈希后存入数据库
	 * 签发 JWT 令牌并返回 access_token 及不含密码的用户信息
	 * 数据冲突返回409错误
	 */
	async register(dto: RegisterDto): Promise<{
		access_token: string;
		user: Omit<User, 'password'>;
	}> {
		const existingUsername = await this.userService.findByUsername(dto.username);
		if (existingUsername) {
			throw new ConflictException('用户名已存在');
		}
		const existingEmail = await this.userService.findByEmail(dto.email);
		if (existingEmail) {
			throw new ConflictException('邮箱已被注册');
		}

		const hashedPassword = await bcrypt.hash(dto.password, 10);
		const user = await this.userService.create({
			username: dto.username,
			email: dto.email,
			password: hashedPassword,
		});

		const payload = { sub: user.id, username: user.username, isAdmin: user.isAdmin };
		const access_token = this.jwtService.sign(payload);

		return { access_token, user };
	}

	/**
	 * 用户登录
	 * 验证用户名和密码，成功后签发JWT令牌
	 * 登录失败返回401错误，账户被禁用则返回403错误
	 */
	async login(dto: LoginDto): Promise<{
		access_token: string;
		user: Pick<User, 'id' | 'username' | 'email'>;
	}> {
		const user = await this.validateUser(dto.username, dto.password);
		if (!user) {
			throw new UnauthorizedException('用户名或密码不正确');
		}
		if (!user.isActive) {
			throw new ForbiddenException('账户已被禁用，请联系管理员');
		}
		const payload = { sub: user.id, username: user.username, isAdmin: user.isAdmin };
		const access_token = this.jwtService.sign(payload);
		const { password: _, ...userInfo } = user;
		return { access_token, user: userInfo };
	}

	/**
	 * 验证用户凭据
	 * 根据用户名查找用户并比对 bcrypt 密码哈希,成功则返回用户对象
	 * 失败则返回 null
	 */
	async validateUser(username: string, password: string): Promise<User | null> {
		const user = await this.userService.findByUsername(username);
		if (!user) {
			return null;
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return null;
		}
		return user;
	}
}
