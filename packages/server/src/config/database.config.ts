import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * 数据库配置工厂函数
 * 从环境变量中读取数据库连接配置
 * @param configService NestJS 配置服务，用于读取 .env 文件中的变量
 * @returns TypeORM 模块配置选项
 */
export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: "mysql",
  host: configService.get<string>("DB_HOST", "127.0.0.1"),
  port: configService.get<number>("DB_PORT", 3306),
  username: configService.get<string>("DB_USERNAME", "root"),
  password: configService.get<string>("DB_PASSWORD", ""),
  database: configService.get<string>("DB_DATABASE", "smart_api_platform"),
  autoLoadEntities: true,
  synchronize: true,
});
