import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { LanguageModel } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// 读取ai api配置并创建模型实例
@Injectable()
export class AiModelFactory {
	private resolveMaxSteps(): number {
		const raw = process.env.AI_MAX_STEPS;
		const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
	}

	createModel(): {
		model: LanguageModel;
		maxSteps: number;
	} {
		const maxSteps = this.resolveMaxSteps();

		const baseURL = process.env.AI_BASE_URL;
		const apiKey = process.env.AI_API_KEY;
		const modelName = process.env.AI_MODEL;
		if (!baseURL || !apiKey || !modelName) {
			throw new ServiceUnavailableException('后端未配置AI端点参数，请在.env或环境变量中设置参数');
		}

		// 接入OpenAI Chat端点
		const provider = createOpenAICompatible({
			name: 'openai-compatible-provider',
			apiKey,
			baseURL,
		});
		return {
			model: provider.chatModel(modelName),
			maxSteps,
		};
	}
}
