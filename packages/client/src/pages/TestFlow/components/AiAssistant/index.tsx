import { Box, Dialog, IconButton, Typography } from '@mui/material';
import type { FC } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { SessionProvider } from './contexts/SessionContext';
import { ChatProvider } from './contexts/ChatContext';
import { SessionList } from './SessionList';
import { ChatArea } from './ChatArea';

type Props = {
	open: boolean;
	onClose: () => void;
	projectId: number;
	selectedTestFlowId: number | null;
	onDataChanged?: (toolName: string) => void;
};

export const AiAssistantModal: FC<Props> = ({ open, onClose, projectId, selectedTestFlowId, onDataChanged }) => {
	const handleClose = (_event: object, reason?: string) => {
		// 防止误触
		if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth
			maxWidth='lg'
			aria-label='AI助手'
			slotProps={{
				paper: {
					sx: {
						height: '90vh',
						display: 'flex',
						flexDirection: 'column',
					},
				},
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					px: 2,
					py: 1,
					borderBottom: 1,
					borderColor: 'divider',
					flexShrink: 0,
				}}
			>
				<AutoAwesomeIcon sx={{ mr: 1 }} />
				<Typography
					variant='h6'
					sx={{ flexGrow: 1, fontSize: '1.05rem' }}
				>
					AI助手
				</Typography>
				<IconButton
					onClick={onClose}
					aria-label='关闭AI助手'
				>
					<CloseIcon />
				</IconButton>
			</Box>
			<Box sx={{ flex: '1 1 auto', display: 'flex', minHeight: 0 }}>
				<SessionProvider projectId={projectId}>
					<Box
						sx={{
							width: 260,
							flexShrink: 0,
							borderRight: 1,
							borderColor: 'divider',
						}}
					>
						<SessionList />
					</Box>
					<Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
						<ChatProvider
							projectId={projectId}
							selectedTestFlowId={selectedTestFlowId}
							onDataChanged={onDataChanged}
						>
							<ChatArea />
						</ChatProvider>
					</Box>
				</SessionProvider>
			</Box>
		</Dialog>
	);
};
