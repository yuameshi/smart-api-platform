import { useContext } from 'react';
import type { FC } from 'react';
import { Alert, Box } from '@mui/material';
import { ChatContext } from '../contexts/ChatContext';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { Placeholder } from './Placeholder';

export const ChatArea: FC = () => {
	const { messages, status, error, clearError } = useContext(ChatContext);

	return (
		<Box
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{error && (
				<Alert
					severity='error'
					onClose={clearError}
					sx={{ m: 1.5, mb: 0 }}
				>
					{error}
				</Alert>
			)}
			<Box sx={{ flex: '1 1 auto', overflow: 'auto', px: 2, minHeight: 0 }}>
				{messages.length === 0 ? (
					<Placeholder />
				) : (
					<MessageList
						messages={messages}
						status={status}
					/>
				)}
			</Box>
			<ChatInput />
		</Box>
	);
};
