import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { CoreModule } from './common/core/core.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { FolderModule } from './modules/folder/folder.module';
import { EndpointModule } from './modules/endpoint/endpoint.module';
import { HttpRequestsModule } from './modules/http-request/http-request.module';
import { TestFlowModule } from './modules/test-flow/test-flow.module';

/**
 * 应用根模块
 * 负责加载全局配置、数据库连接、核心基础设施和业务模块
 */
@Module({
	imports: [
		// 全局核心模块
		CoreModule,
		// 加载 .env 文件
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig, databaseConfig, jwtConfig],
			envFilePath: ['.env', '.env.example'],
		}),
		// TypeORM
		TypeOrmModule.forRootAsync({
			useFactory: (dbConfig: Record<string, unknown>) => dbConfig,
			inject: [databaseConfig.KEY],
		}),
		// 业务模块
		UserModule,
		AuthModule,
		ProjectModule,
		FolderModule,
		EndpointModule,
		HttpRequestsModule,
		TestFlowModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*all');
	}
}
