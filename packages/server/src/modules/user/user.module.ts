import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AdminGuard } from '@/common/guards/admin.guard';

/**
 * 用户模块
 */
@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [UserController],
	providers: [UserService, AdminGuard],
	exports: [UserService],
})
export class UserModule {}
