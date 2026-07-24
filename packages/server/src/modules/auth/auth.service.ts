import { Injectable } from "@nestjs/common";

/**
 * 认证服务（占位服务）
 *
 * 当前为占位服务，仅提供基础方法。
 * 未来将添加用户登录、注册、JWT 令牌生成与验证等认证逻辑。
 */
@Injectable()
export class AuthService {
  /**
   * 返回问候信息
   * @returns 问候字符串
   */
  hello(): string {
    return "Hello from Auth Service!";
  }
}
