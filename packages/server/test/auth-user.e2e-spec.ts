import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/user/entities/user.entity';
import { UserService } from '../src/modules/user/user.service';
import databaseConfig from '../src/config/database.config';

function decodeJwtPayload(token: string): Record<string, unknown> {
	const payload = token.split('.')[1];
	return JSON.parse(Buffer.from(payload, 'base64url').toString());
}

// 注册和登录整个流程测试
describe('注册登录E2E测试', () => {
	let app: INestApplication;
	let userService: UserService;

	let adminToken: string;
	let userId: number;
	let secondUserId: number;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(databaseConfig.KEY)
			.useValue({
				type: 'sqljs',
				entities: [User],
				synchronize: true,
			})
			.compile();

		app = module.createNestApplication();
		// 设置前缀
		app.setGlobalPrefix('api');
		await app.init();

		userService = module.get<UserService>(UserService);
	});

	afterAll(async () => {
		await app.close();
	});

	// 注册
	describe('POST /api/auth/register', () => {
		it('应注册新用户并返回 201 及 access_token', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/auth/register')
				.send({
					username: 'e2euser',
					email: 'e2e@example.com',
					password: 'password123',
				})
				.expect(201);

			const body = res.body;
			expect(body.code).toBe(201);
			expect(body.data.access_token).toBeDefined();
			expect(body.data.user).toBeDefined();
			expect(body.data.user.username).toBe('e2euser');
			expect(body.data.user.email).toBe('e2e@example.com');
			expect(body.data.user.password).toBeUndefined();

			userId = body.data.user.id;
		});

		it('用户名重复时应返回 409', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/auth/register')
				.send({
					username: 'e2euser',
					email: 'other@example.com',
					password: 'password123',
				})
				.expect(409);

			expect(res.body.code).toBe(409);
		});

		it('邮箱重复时应返回 409', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/auth/register')
				.send({
					username: 'otheruser',
					email: 'e2e@example.com',
					password: 'password123',
				})
				.expect(409);

			expect(res.body.code).toBe(409);
		});
	});

	// 登录
	describe('POST /api/auth/login', () => {
		it('应登录成功并返回 200 及包含 isAdmin 的 access_token', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/auth/login')
				.send({
					username: 'e2euser',
					password: 'password123',
				})
				.expect(200);

			const body = res.body;
			expect(body.code).toBe(200);
			expect(body.data.access_token).toBeDefined();
			expect(body.data.user).toBeDefined();
			expect(body.data.user.username).toBe('e2euser');

			// 验证 JWT payload 中包含 isAdmin 声明
			const payload = decodeJwtPayload(body.data.access_token);
			expect(payload).toHaveProperty('isAdmin');
			expect(payload.username).toBe('e2euser');
		});

		it('密码错误时应返回401', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/auth/login')
				.send({
					username: 'e2euser',
					password: 'wrongpassword',
				})
				.expect(401);

			expect(res.body.code).toBe(401);
		});

		it('用户不存在时应返回401', async () => {
			await request(app.getHttpServer())
				.post('/api/auth/login')
				.send({
					username: 'nobody',
					password: 'password123',
				})
				.expect(401);
		});
	});

	// 管理员操作
	describe('管理员修改和删除', () => {
		let regularToken: string;

		beforeAll(async () => {
			// 先改成管理员然后重新登陆
			await userService.update(userId, { isAdmin: true });

			const loginRes = await request(app.getHttpServer())
				.post('/api/auth/login')
				.send({ username: 'e2euser', password: 'password123' })
				.expect(200);

			adminToken = loginRes.body.data.access_token;

			// 新建用于操作的第二个用户
			const regRes = await request(app.getHttpServer())
				.post('/api/auth/register')
				.send({
					username: 'targetuser',
					email: 'target@example.com',
					password: 'password123',
				})
				.expect(201);

			secondUserId = regRes.body.data.user.id;

			// 新建第三个用户
			const regularRes = await request(app.getHttpServer())
				.post('/api/auth/register')
				.send({
					username: 'regularuser',
					email: 'regular@example.com',
					password: 'password123',
				})
				.expect(201);

			regularToken = regularRes.body.data.access_token;
		});

		it('PATCH /api/user/:id 应更新用户并返回200', async () => {
			await request(app.getHttpServer())
				.patch(`/api/user/${secondUserId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ email: 'updated@example.com' })
				.expect(200);

			// 验证更新已生效
			const profileRes = await request(app.getHttpServer())
				.get(`/api/user/${secondUserId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);

			expect(profileRes.body.data.email).toBe('updated@example.com');
		});

		it('PATCH /api/user/:id 非管理员应返回403', async () => {
			await request(app.getHttpServer())
				.patch(`/api/user/${secondUserId}`)
				.set('Authorization', `Bearer ${regularToken}`)
				.send({ email: 'hacker@example.com' })
				.expect(403);
		});

		it('DELETE /api/user/:id 应删除用户并返回200', async () => {
			await request(app.getHttpServer())
				.delete(`/api/user/${secondUserId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);

			// 验证删除后返回 null
			const res = await request(app.getHttpServer())
				.get(`/api/user/${secondUserId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);

			expect(res.body.data).toBeNull();
		});

		it('DELETE /api/user/:id 非管理员应返回403', async () => {
			await request(app.getHttpServer()).delete(`/api/user/${userId}`).set('Authorization', `Bearer ${regularToken}`).expect(403);
		});
	});
});
