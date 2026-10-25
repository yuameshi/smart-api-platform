import { Injectable } from '@nestjs/common';
import type { ToolSet } from 'ai';
import type { AiToolContext } from './ai-tool-exec-wrapper';
import { createProjectTools } from './project.tools';
import { createEndpointTools } from './endpoint.tools';
import { createTestFlowTools } from './test-flow.tools';
import { createTestStepTools } from './test-step.tools';

// 注册工具集
@Injectable()
export class AiToolService {
	buildTools(ctx: AiToolContext): ToolSet {
		return {
			...createProjectTools(ctx),
			...createEndpointTools(ctx),
			...createTestFlowTools(ctx),
			...createTestStepTools(ctx),
		};
	}
}
