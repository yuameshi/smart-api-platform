import { Box, Typography } from '@mui/material';
import type { FC } from 'react';
import { isToolUIPart, type UIMessage } from 'ai';
import { MarkdownView } from './MarkdownView';
import { ThinkingBlock } from './ThinkingBlock';
import { ToolCallCard } from './ToolCallCard';

// 根据part类型渲染对应的小组件
function renderPart(part: UIMessage['parts'][number], index: number, isUser: boolean) {
	if (part.type === 'text') {
		return isUser ? (
			<Typography
				key={index}
				variant='body2'
				sx={{ whiteSpace: 'pre-wrap' }}
			>
				{part.text}
			</Typography>
		) : (
			<MarkdownView
				key={index}
				text={part.text}
			/>
		);
	}
	if (part.type === 'reasoning') {
		return (
			<ThinkingBlock
				key={index}
				text={part.text}
			/>
		);
	}
	if (part.type === 'step-start') {
		// 开始执行会话
		return null;
	}
	if (isToolUIPart(part)) {
		return (
			<ToolCallCard
				key={part.toolCallId}
				part={part}
			/>
		);
	}
	return null;
}

export const MessageBubble: FC<{ message: UIMessage }> = ({ message }) => {
	const isUser = message.role === 'user';

	return (
		<Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 2 }}>
			<Box
				sx={{
					maxWidth: isUser ? '75%' : '100%',
					minWidth: 0,
					...(isUser && { bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2, px: 1.5, py: 1 }),
				}}
			>
				{message.parts.map((part, index) => renderPart(part, index, isUser))}
			</Box>
		</Box>
	);
};
