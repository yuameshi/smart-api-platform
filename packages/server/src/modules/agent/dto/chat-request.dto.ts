import { ArrayMinSize, IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { AiChatRequestBody, AiMessageInput } from 'shared';

// 历史消息列表
// parts/metadata由convertToModelMessages处理
export class ChatMessageDto implements AiMessageInput {
	@IsString()
	@IsNotEmpty()
	id!: string;

	@IsIn(['user', 'assistant', 'system'])
	role!: 'user' | 'assistant' | 'system';

	// 全局ValidationPipe开了enableImplicitConversion
	// 指定type为object避免class-transformer把part对象转为空数组
	@IsArray()
	@Type(() => Object)
	parts!: unknown[];

	@IsOptional()
	metadata?: unknown;
}

export class ChatRequestDto implements AiChatRequestBody {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => ChatMessageDto)
	messages!: AiMessageInput[];

	@IsUUID()
	sessionId!: string;

	@IsInt()
	projectId!: number;

	@IsOptional()
	@IsInt()
	selectedTestFlowId?: number;
}
