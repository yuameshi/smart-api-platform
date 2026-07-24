import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

/**
 * 用户模块
 * 集中管理用户相关的控制器、服务和实体
 * 通过 TypeORM 模块注册 User 实体以支持数据库操作
 * 导出 UserService 供其他模块使用
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
