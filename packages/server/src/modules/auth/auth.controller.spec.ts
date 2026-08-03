import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
	let controller: AuthController;
	let service: jest.Mocked<AuthService>;

	beforeEach(async () => {
		const mockService = {
			register: jest.fn(),
			login: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: mockService,
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		service = module.get(AuthService);
	});

	// 测试控制器是否能够正确初始化
	it('应该被正确初始化', () => {
		expect(controller).toBeDefined();
	});

	// 测试注册路由
	describe('POST /api/auth/register', () => {
		it('应该调用 authService.register 并返回注册结果', async () => {
			const registerDto: RegisterDto = {
				username: 'newuser',
				email: 'new@example.com',
				password: 'password123',
			};
			const mockResult = {
				access_token: 'mock_jwt_token',
				user: {
					id: 1,
					username: 'newuser',
					email: 'new@example.com',
					isAdmin: false,
					isActive: true,
					createdAt: new Date(),
				},
			};
			service.register.mockResolvedValue(mockResult as any);

			const result = await controller.register(registerDto);

			expect(result).toEqual(mockResult);
			expect(service.register).toHaveBeenCalledWith(registerDto);
			expect(service.register).toHaveBeenCalledTimes(1);
		});
	});

	// 测试登录路由
	describe('POST /api/auth/login', () => {
		it('应该调用 authService.login 并返回登录结果', async () => {
			const loginDto: LoginDto = {
				username: 'testuser',
				password: 'password123',
			};
			const mockResult = {
				access_token: 'mock_jwt_token',
				user: { id: 1, username: 'testuser', email: 'test@example.com' },
			};
			service.login.mockResolvedValue(mockResult as any);

			const result = await controller.login(loginDto);

			expect(result).toEqual(mockResult);
			expect(service.login).toHaveBeenCalledWith(loginDto);
			expect(service.login).toHaveBeenCalledTimes(1);
		});
	});
});
