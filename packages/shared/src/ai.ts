/** 聊天消息角色 */
export type AiChatRole = 'system' | 'user' | 'assistant';

export type AiChatStatus = 'ready' | 'submitted' | 'streaming';

/** AI消息写入数据库前的类型，UIMessage类似物  */
export type AiMessageInput = {
	id: string;
	role: AiChatRole;
	parts: unknown[];
	metadata?: unknown;
};

/** 储存后的/API传输的消息结构，添加createdAt */
export type AiStoredMessage = AiMessageInput & {
	createdAt: string;
};

/** 会话列表项 */
export type AiSessionSummary = {
	id: string;
	projectId: number;
	title: string;
	messageCount: number;
	createdAt: string;
	updatedAt: string;
};

/** 会话详情 */
export type AiSessionDetail = AiSessionSummary & {
	messages: AiStoredMessage[];
};

/** 创建会话请求体 */
export type CreateAiSessionRequest = {
	projectId: number;
	title?: string;
};

/** 对话接口请求体，客户端每次发完整消息历史，减少数据库压力 */
export type AiChatRequestBody = {
	messages: AiMessageInput[];
	sessionId: string;
	projectId: number;
	selectedTestFlowId?: number;
};
