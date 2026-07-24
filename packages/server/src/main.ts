import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * 应用启动入口
 */
async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: true,
			credentials: true,
		},
	});

	// 设置全局路由前缀
	app.setGlobalPrefix('api');

	// 获取端口配置
	const configService = app.get(ConfigService);
	const port = configService.get<number>('app.port', 3000);

	await app.listen(port);
	Logger.log(`应用已启动: http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
