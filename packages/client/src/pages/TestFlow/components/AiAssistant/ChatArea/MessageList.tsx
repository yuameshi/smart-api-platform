import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { AiChatStatus } from 'shared';
import type { UIMessage } from 'ai';
import { MessageBubble } from './MessageBubble';

type Props = {
	messages: UIMessage[];
	status: AiChatStatus;
};

export const MessageList: FC<Props> = ({ messages, status }) => {
	const bottomRef = useRef<HTMLDivElement>(null);

	// 收到新消息时滚动到底部
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}, [messages]);

	const last = messages[messages.length - 1];
	const waiting = (status === 'submitted' || status === 'streaming') && last?.role === 'assistant' && last.parts.length === 0;

	return (
		<Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
			{messages.map(m => (
				<MessageBubble
					key={m.id}
					message={m}
				/>
			))}
			{waiting && (
				// 发了消息但是没有回复前的等待状态
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 2 }}>
					<CircularProgress size={14} />
					<Typography variant='caption'>请稍候...</Typography>
				</Box>
			)}
			<div ref={bottomRef} />
		</Box>
	);
};
