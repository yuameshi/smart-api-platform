import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestFlow } from './entities/test-flow.entity';
import { TestStep } from './entities/test-step.entity';
import { TestFlowService } from './test-flow.service';
import { TestFlowController } from './test-flow.controller';
import { ProjectModule } from '@/modules/project/project.module';
import { TestFlowRun } from './entities/test-flow-run.entity';
import { TestFlowRunnerService } from './runner/test-flow-runner.service';
import { TestFlowRunRecordService } from './run/test-flow-run-record.service';
import { RunEventStream } from './run/run-event-stream';
import { HttpRequestsModule } from '@/modules/http-request/http-request.module';

@Module({
	imports: [TypeOrmModule.forFeature([TestFlow, TestStep, TestFlowRun]), ProjectModule, HttpRequestsModule],
	controllers: [TestFlowController],
	providers: [TestFlowService, TestFlowRunnerService, TestFlowRunRecordService, RunEventStream],
})
export class TestFlowModule {}
