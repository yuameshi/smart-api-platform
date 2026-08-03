import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import type { PublicUser } from 'shared';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	/**
	 * 将用户实体映射为对外公开的用户对象
	 */
	toPublicUser(user: User): PublicUser {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			isAdmin: user.isAdmin,
			isActive: user.isActive,
			createdAt: user.createdAt.toISOString(),
			// 忽略密码字段
		};
	}

	/**
	 * 查询所有用户
	 * 返回用户列表的 Promise
	 */
	async findAll(): Promise<PublicUser[]> {
		const users = await this.userRepository.find();
		return users.map(user => this.toPublicUser(user));
	}

	/**
	 * 根据 ID 查询单个用户
	 * 返回对应的用户对象
	 * 如果不存在则返回 null
	 */
	async findOne(id: number): Promise<PublicUser | null> {
		const user = await this.userRepository.findOneBy({ id });
		return user ? this.toPublicUser(user) : null;
	}

	/**
	 * 极少数情况下使用的获取含密码的用户对象
	 * 行为与 findOne 一致
	 */
	async dangerouslyGetFullUserObjectById(id: number): Promise<User | null> {
		const user = await this.userRepository.findOneBy({ id });
		return user ? user : null;
	}

	/**
	 * 根据用户名查询用户
	 * 返回对应的用户对象
	 * 如果不存在则返回 null
	 */
	async findByUsername(username: string): Promise<PublicUser | null> {
		const user = await this.userRepository.findOneBy({ username });
		return user ? this.toPublicUser(user) : null;
	}

	/**
	 * 根据邮箱查询用户
	 * 返回对应的用户对象
	 * 如果不存在则返回 null
	 */
	async findByEmail(email: string): Promise<PublicUser | null> {
		const user = await this.userRepository.findOneBy({ email });
		return user ? this.toPublicUser(user) : null;
	}

	/**
	 * 创建新用户
	 * 用户数据，包含用户名、邮箱、密码等字段，统一进行 bcrypt 哈希处理
	 * 返回创建后的用户对象（含ID）
	 */
	async create(data: Partial<User>): Promise<PublicUser> {
		if (!data.password) {
			throw new BadRequestException('密码不能为空');
		}
		data.password = await bcrypt.hash(data.password, 10);
		const saved = await this.userRepository.save(data);
		return this.toPublicUser(saved);
	}

	/**
	 * 根据 ID 更新用户信息
	 */
	async update(id: number, data: Partial<User>): Promise<void> {
		await this.userRepository.update(id, data);
	}

	/**
	 * 根据 ID 删除用户
	 */
	async delete(id: number): Promise<void> {
		await this.userRepository.delete(id);
	}
}
