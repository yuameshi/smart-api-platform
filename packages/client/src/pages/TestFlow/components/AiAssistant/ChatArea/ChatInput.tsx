import { useContext, useState } from 'react';
import type { FC, KeyboardEvent } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import { ChatContext } from '../contexts/ChatContext';

export const ChatInput: FC = () => {
	const { status, sendMessage, stop } = useContext(ChatContext);
	const [text, setText] = useState('');
	const busy = status !== 'ready';
	const canSend = text.trim().length > 0 && !busy;

	const handleSend = () => {
		if (!canSend) return;
		void sendMessage(text.trim());
		setText('');
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		// 按Enter发送消息，Shift+Enter换行
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', p: 1.5, borderTop: 1, borderColor: 'divider' }}>
			<TextField
				fullWidth
				multiline
				maxRows={4}
				size='small'
				placeholder='Enter发送，Shift+Enter换行'
				value={text}
				onChange={e => setText(e.target.value)}
				onKeyDown={handleKeyDown}
				disabled={busy}
			/>
			{busy ? (
				<IconButton
					color='error'
					onClick={stop}
					aria-label='停止'
				>
					<StopIcon />
				</IconButton>
			) : (
				<IconButton
					color='primary'
					onClick={handleSend}
					disabled={!canSend}
					aria-label='发送'
				>
					<SendIcon />
				</IconButton>
			)}
		</Box>
	);
};
