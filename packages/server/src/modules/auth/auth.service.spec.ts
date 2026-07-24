import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  /**
   * 在每个测试前创建测试模块并获取服务实例
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("应被正确定义", () => {
    expect(service).toBeDefined();
  });

  describe("hello", () => {
    it("应返回正确的问候信息", () => {
      const result = service.hello();
      expect(result).toBe("Hello from Auth Service!");
    });
  });
});
