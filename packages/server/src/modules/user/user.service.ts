import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

/**
 * 用户服务类
 * 封装用户相关的业务逻辑和数据库操作
 * 使用 Data Mapper 模式，通过 Repository 与数据库交互
 */
@Injectable()
export class UserService {
	/**
	 * 构造函数
	 * 注入 User 实体对应的 TypeORM 仓库
	 * @param userRepository - 用户数据仓库，提供数据库 CRUD 操作
	 */
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	/**
	 * 测试接口
	 * @returns 返回欢迎信息字符串
	 */
	hello(): string {
		return 'Hello from User Service!';
	}

	/**
	 * 查询所有用户
	 * @returns 返回用户列表的 Promise
	 */
	async findAll(): Promise<User[]> {
		return this.userRepository.find();
	}

	/**
	 * 根据 ID 查询单个用户
	 * @param id - 用户唯一标识符
	 * @returns 返回对应的用户对象，如果不存在则返回 null
	 */
	async findOne(id: number): Promise<User | null> {
		return this.userRepository.findOneBy({ id });
	}

	/**
	 * 创建新用户
	 * @param data - 用户数据，包含用户名、邮箱、密码等字段
	 * @returns 返回创建后的用户对象（包含生成的 ID 等字段）
	 */
	async create(data: Partial<User>): Promise<User> {
		return this.userRepository.save(data);
	}
}
