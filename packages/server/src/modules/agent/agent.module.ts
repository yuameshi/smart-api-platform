import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from '@/modules/project/project.module';
import { EndpointModule } from '@/modules/endpoint/endpoint.module';
import { TestFlowModule } from '@/modules/test-flow/test-flow.module';
import { AiSession } from './entities/ai-session.entity';
import { AiMessage } from './entities/ai-message.entity';
import { AiSessionService } from './ai-session.service';
import { AiSessionController } from './ai-session.controller';
import { AiModelFactory } from './ai-model.factory';
import { AiToolService } from './tools/ai-tool.service';
import { AgentService } from './agent.service';
import { AiController } from './ai.controller';

@Module({
	imports: [TypeOrmModule.forFeature([AiSession, AiMessage]), ProjectModule, EndpointModule, TestFlowModule],
	controllers: [AiController, AiSessionController],
	providers: [AgentService, AiSessionService, AiModelFactory, AiToolService],
	exports: [AiSessionService],
})
export class AgentModule {}
