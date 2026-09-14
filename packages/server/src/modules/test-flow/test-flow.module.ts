import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestFlow } from './entities/test-flow.entity';
import { TestFlowService } from './test-flow.service';
import { TestFlowController } from './test-flow.controller';
import { ProjectModule } from '@/modules/project/project.module';

@Module({
	imports: [TypeOrmModule.forFeature([TestFlow]), ProjectModule],
	controllers: [TestFlowController],
	providers: [TestFlowService],
})
export class TestFlowModule {}
