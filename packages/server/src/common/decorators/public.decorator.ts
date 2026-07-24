import { SetMetadata } from '@nestjs/common';

/**
 * 标记路由为公开访问（无需鉴权）
 * 配合 JwtAuthGuard 使用，在 guard 中检查 IS_PUBLIC_KEY 跳过认证
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
