import { useContext } from 'react';
import type { FC } from 'react';
import { Box, Button, CircularProgress, IconButton, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { SessionContext } from '../contexts/SessionContext';

export const SessionList: FC = () => {
	const { sessions, activeId, loading, createAndOpen, select, remove } = useContext(SessionContext);

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
				<Button
					fullWidth
					size='small'
					variant='outlined'
					startIcon={<AddIcon />}
					onClick={() => void createAndOpen()}
				>
					新建会话
				</Button>
			</Box>
			<Box sx={{ flex: '1 1 auto', overflow: 'auto', minHeight: 0 }}>
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress size={24} />
					</Box>
				) : (
					<List disablePadding>
						{sessions.map(session => (
							<ListItem
								key={session.id}
								disablePadding
								secondaryAction={
									<IconButton
										size='small'
										edge='end'
										aria-label='删除会话'
										onClick={() => remove(session.id)}
									>
										<DeleteIcon fontSize='small' />
									</IconButton>
								}
							>
								<ListItemButton
									selected={session.id === activeId}
									onClick={() => select(session.id)}
								>
									<ListItemText
										primary={session.title}
										secondary={new Date(session.updatedAt).toLocaleString('zh-CN', {
											month: 'numeric',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									/>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				)}
			</Box>
		</Box>
	);
};
