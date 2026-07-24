import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

/**
 * 认证模块（占位模块）
 *
 * 当前为占位模块，仅提供基础的路由和服务。
 * 未来将集成 JWT 认证、数据库用户实体等功能。
 */
@Module({
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
