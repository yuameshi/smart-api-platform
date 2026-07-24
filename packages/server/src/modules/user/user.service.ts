import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	/**
	 * 查询所有用户
	 * 返回用户列表的 Promise
	 */
	async findAll(): Promise<Omit<User, 'password'>[]> {
		const users = await this.userRepository.find();
		return users.map(({ password, ...rest }) => rest as Omit<User, 'password'>);
	}

	/**
	 * 根据 ID 查询单个用户
	 * 返回对应的用户对象
	 * 如果不存在则返回 null
	 */
	async findOne(id: number): Promise<Omit<User, 'password'> | null> {
		const user = await this.userRepository.findOneBy({ id });
		if (!user) return null;
		const { password, ...rest } = user;
		return rest as Omit<User, 'password'>;
	}

	/**
	 * 根据用户名查询用户
	 * 返回对应的用户对象
	 * 如果不存在则返回 null
	 */
	async findByUsername(username: string): Promise<User | null> {
		return this.userRepository.findOneBy({ username });
	}

	/**
	 * 根据邮箱查询用户
	 * 返回对应的用户对象
	 * 如果不存在则返回 null
	 */
	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findOneBy({ email });
	}

	/**
	 * 创建新用户
	 * 用户数据，包含用户名、邮箱、密码等字段
	 * 返回创建后的用户对象（含ID）
	 */
	async create(data: Partial<User>): Promise<Omit<User, 'password'>> {
		const saved = await this.userRepository.save(data);
		const { password, ...rest } = saved;
		return rest as Omit<User, 'password'>;
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
