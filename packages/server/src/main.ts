import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

/**
 * 应用启动入口
 * 配置全局管道、过滤器、拦截器和 CORS
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  // 设置全局路由前缀
  app.setGlobalPrefix("api");

  // 启用全局验证管道，自动转换和过滤非法参数
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 注册全局日志拦截器
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 启动应用，监听 3000 端口
  const url = await app.listen(3000);
  console.log("应用已启动: " + url);
}

bootstrap();
