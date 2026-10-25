import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { useChat } from '@ai-sdk/react';
import {
	//
	DefaultChatTransport,
	getToolName,
	isToolUIPart,
	lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai';
import type { UIMessage } from 'ai';
import { API_BASE_URL } from '@/constants/config';
import { getAuthToken } from '@/services/api';
import { getAiSession } from '@/services/aiSessions';
import { SessionContext } from './SessionContext';
import type { AiChatStatus } from 'shared';

// 会修改数据的工具名列表
const MUTATING_TOOLS = [
	'create_test_flow',
	'rename_test_flow',
	'delete_test_flow',
	'create_test_step',
	'update_test_step',
	'delete_test_step',
	'reorder_test_steps',
];

type ChatContextValue = {
	messages: UIMessage[];
	status: AiChatStatus;
	error: string | null;
	sendMessage: (text: string) => Promise<void>;
	stop: () => void;
	addToolApprovalResponse: (args: { id: string; approved: boolean }) => void | PromiseLike<void>;
	setMessages: (messages: UIMessage[]) => void;
	clearError: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ChatContext = createContext<ChatContextValue>({
	messages: [],
	status: 'ready',
	error: null,
	sendMessage: async () => {},
	stop: () => {},
	addToolApprovalResponse: () => {},
	setMessages: () => {},
	clearError: () => {},
});

type Props = PropsWithChildren<{
	projectId: number;
	selectedTestFlowId: number | null;
	onDataChanged?: (toolName: string) => void;
}>;

// 右侧对话区的上下文，使用DefaultChatTransport通信
// 在写入工具完成后通知页面刷新
export const ChatProvider: FC<Props> = ({ projectId, selectedTestFlowId, onDataChanged, children }) => {
	const { activeId, refresh: refreshSessions } = useContext(SessionContext);
	const token = getAuthToken();
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: `${API_BASE_URL}/ai/chat`,
				headers: { Authorization: `Bearer ${token ?? ''}` },
				body: {
					sessionId: activeId,
					projectId,
					...(selectedTestFlowId != null ? { selectedTestFlowId } : {}),
				},
			}),
		[activeId, projectId, selectedTestFlowId, token],
	);

	const {
		messages,
		status: chatStatus,
		error: chatError,
		sendMessage: sdkSendMessage,
		stop,
		addToolApprovalResponse,
		setMessages,
		clearError,
	} = useChat({
		transport,
		// 用户审批完成后自动把消息重新提交给后端继续任务
		sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
		onFinish: () => {
			void refreshSessions();
		},
	});

	// 记录已经通知过刷新的写工具记录，格式为messageId:toolCallId
	const notifiedRef = useRef<Set<string>>(new Set());

	// 加载历史消息
	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			if (!activeId) {
				notifiedRef.current = new Set();
				setMessages([]);
				return;
			}
			try {
				const detail = await getAiSession(activeId);
				if (cancelled) return;
				// 转成UiMessage格式
				const uiMessages = detail.messages.map(message => ({
					id: message.id,
					role: message.role,
					metadata: message.metadata,
					parts: message.parts as UIMessage['parts'],
				}));
				// 先记录历史记录中已执行完毕的写操作
				const finishedKeys = new Set<string>();
				for (const message of uiMessages) {
					for (const part of message.parts) {
						if (isToolUIPart(part) && part.state === 'output-available' && MUTATING_TOOLS.includes(getToolName(part))) {
							finishedKeys.add(`${message.id}:${part.toolCallId}`);
						}
					}
				}
				notifiedRef.current = finishedKeys;
				setMessages(uiMessages);
			} catch {
				// 忽略历史记录加载失败，保持空列表，请求错误从useChat的error里读取
			}
		};
		void load();
		return () => {
			cancelled = true;
		};
	}, [activeId, setMessages]);

	// 写工具执行成功后通知页面刷新数据，
	useEffect(() => {
		for (const message of messages) {
			for (const part of message.parts) {
				if (!isToolUIPart(part) || part.state !== 'output-available') continue;
				const toolName = getToolName(part);
				if (!MUTATING_TOOLS.includes(toolName)) continue;
				const key = `${message.id}:${part.toolCallId}`;
				if (notifiedRef.current.has(key)) continue;
				notifiedRef.current.add(key);
				onDataChanged?.(toolName);
			}
		}
	}, [messages, onDataChanged]);

	const sendMessage = useCallback(
		async (text: string) => {
			// 会话ID为空或发送为空时不发送
			if (!activeId || !text.trim()) return;
			await sdkSendMessage({ text });
		},
		[activeId, sdkSendMessage],
	);

	// 把error转为ready其余不变
	const status: AiChatStatus = chatStatus === 'submitted' || chatStatus === 'streaming' ? chatStatus : 'ready';

	const error = chatError?.message ?? null;

	const contextValue = useMemo(
		() => ({
			messages,
			status,
			error,
			sendMessage,
			stop,
			addToolApprovalResponse,
			setMessages,
			clearError,
		}),
		[messages, status, error, sendMessage, stop, addToolApprovalResponse, setMessages, clearError],
	);

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};
