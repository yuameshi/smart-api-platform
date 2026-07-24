import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig } from "./config/database.config";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";

/**
 * 应用根模块
 * 负责加载全局配置、数据库连接和业务模块
 */
@Module({
  imports: [
    // 全局配置模块，加载 .env 文件
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    // TypeORM 数据库连接，使用异步配置工厂
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        databaseConfig(configService),
    }),
    // 业务模块
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
