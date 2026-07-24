import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { UserService } from "./user.service";

/**
 * 用户控制器类
 * 处理与用户相关的 HTTP 请求和路由
 * 路由前缀为 /user
 */
@Controller("user")
export class UserController {
  /**
   * 构造函数
   * @param userService - 用户服务实例，负责业务逻辑处理
   */
  constructor(private readonly userService: UserService) {}

  /**
   * 测试接口 - GET /user/hello
   * 用于验证用户模块是否正常工作
   * @returns 返回包含欢迎信息的 JSON 对象
   */
  @Get("hello")
  hello() {
    return { message: this.userService.hello() };
  }

  /**
   * 查询所有用户 - GET /user
   * 获取系统中所有已注册的用户列表
   * @returns 返回用户列表的 JSON 数组
   */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * 查询单个用户 - GET /user/:id
   * 根据用户 ID 获取对应的用户信息
   * @param id - URL 路径中的用户 ID
   * @returns 返回对应的用户对象
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  /**
   * 创建新用户 - POST /user
   * 提交用户信息以创建新的用户记录
   * @param body - 请求体中的用户数据
   * @returns 返回创建后的用户对象
   */
  @Post()
  create(@Body() body: Partial<any>) {
    return this.userService.create(body);
  }
}
