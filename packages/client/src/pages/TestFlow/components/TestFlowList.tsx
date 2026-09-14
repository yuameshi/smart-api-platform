import { useContext, type FC } from 'react';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemText, Tooltip, Typography } from '@mui/material';
import { PageContext } from './PageContext';
import { useNavigate } from 'react-router';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export const TestFlowList: FC = () => {
	const {} = useContext(PageContext);
	const navigate = useNavigate();
	const {
		projectId,
		selectedControls: { selectedId, setSelectedId },
		requestCreateOrEdit,
		requestDelete,
		flowControls: { flows },
	} = useContext(PageContext);

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Box
				sx={{
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%',
					borderBottom: 1,
					borderColor: 'divider',
				}}
			>
				<Typography
					variant='subtitle2'
					sx={{ px: 2, py: 1, color: 'text.secondary' }}
				>
					<Typography
						component='span'
						variant='subtitle2'
						sx={{ mr: 0.5 }}
					>
						#{projectId}
					</Typography>
					测试流程
				</Typography>
				<Box
					sx={{
						display: 'flex',
						// 对齐下方list的icon
						gap: 1,
						pr: 1,
					}}
				>
					<Tooltip title='返回工作台'>
						<IconButton
							size='small'
							onClick={() => navigate(`/projects/${projectId}`)}
							aria-label='返回工作台'
						>
							<ArrowBackIcon fontSize='small' />
						</IconButton>
					</Tooltip>
					<Tooltip title='新建流程'>
						<IconButton
							size='small'
							onClick={() => requestCreateOrEdit('create', null)}
							aria-label='新建流程'
						>
							<AddIcon fontSize='small' />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>
			<Box sx={{ flex: '1 1 auto', overflow: 'auto' }}>
				<List disablePadding>
					{flows.map(flow => (
						<ListItem
							disablePadding
							secondaryAction={
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<Tooltip title='编辑'>
										<IconButton
											size='small'
											aria-label='编辑流程'
											onClick={() => requestCreateOrEdit('edit', flow)}
										>
											<EditIcon fontSize='small' />
										</IconButton>
									</Tooltip>
									<Tooltip title='删除'>
										<IconButton
											size='small'
											aria-label='删除流程'
											onClick={() => requestDelete(flow)}
										>
											<DeleteIcon fontSize='small' />
										</IconButton>
									</Tooltip>
								</Box>
							}
						>
							<ListItemButton
								selected={selectedId === flow.id}
								onClick={() => setSelectedId(flow.id)}
							>
								<ListItemText primary={flow.name} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>
		</Box>
	);
};
