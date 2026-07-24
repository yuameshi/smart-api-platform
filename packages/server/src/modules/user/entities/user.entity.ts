import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * 用户实体类
 * 使用 Data Mapper 模式，通过 TypeORM 的 Repository 与数据库交互
 * 对应数据库中的 user 表
 */
@Entity('user')
export class User {
	/**
	 * 用户唯一标识符
	 * 自增主键，每创建一个用户自动递增
	 */
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * 用户名
	 * 唯一字段，不允许重复
	 * 最大长度为 50 个字符
	 */
	@Column({ unique: true, length: 50 })
	username: string;

	/**
	 * 用户邮箱
	 * 唯一字段，不允许重复
	 * 最大长度为 100 个字符
	 */
	@Column({ unique: true, length: 100 })
	email: string;

	/**
	 * 用户密码
	 * 存储加密后的密码哈希值
	 * 最大长度为 255 个字符
	 */
	@Column({ length: 255 })
	password: string;

	/**
	 * 是否管理员
	 * 默认为 false，普通用户
	 */
	@Column({ default: false })
	isAdmin: boolean;

	/**
	 * 是否激活
	 * 默认为 true，用户创建后自动激活
	 */
	@Column({ default: true })
	isActive: boolean;

	/**
	 * 创建时间
	 * 记录用户注册的时间，由 TypeORM 自动设置
	 */
	@CreateDateColumn()
	createdAt: Date;
}
