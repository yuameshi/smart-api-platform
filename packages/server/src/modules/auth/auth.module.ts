import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UserModule } from '../user/user.module';

/**
 * 认证模块
 * - 导入 UserModule 以使用 UserService
 */
@Module({
	imports: [
		UserModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService): JwtModuleOptions => ({
				secret: config.get<string>('jwt.secret'),
				signOptions: {
					algorithm: config.get<string>('jwt.algorithm', 'HS256') as 'HS256',
					expiresIn: config.get<string>('jwt.expiresIn', '7d') as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y' | 'ms'}`,
				},
			}),
		}),
	],
	providers: [
		AuthService,
		// 将 JwtAuthGuard 注册为全局守卫，保护所有路由
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
