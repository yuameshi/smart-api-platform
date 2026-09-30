import { Module } from '@nestjs/common';
import { ProjectModule } from '@/modules/project/project.module';
import { HttpRequestsService } from './http-request.service';
import { HttpRequestController } from './http-request.controller';

@Module({
	imports: [ProjectModule],
	controllers: [HttpRequestController],
	providers: [HttpRequestsService],
	exports: [HttpRequestsService],
})
export class HttpRequestsModule {}
