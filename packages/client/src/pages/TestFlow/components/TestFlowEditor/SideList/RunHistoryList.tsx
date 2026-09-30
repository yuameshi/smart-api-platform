import { useContext } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import type { FC } from 'react';
import type { PersistedTestRunStatus } from 'shared';
import { RunContext } from '../Contexts/RunContext';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

// 根据运行状态分配图标和文字
const getStatusMeta = (status: PersistedTestRunStatus) => {
	switch (status) {
		case 'passed':
			return {
				icon: (
					<CheckCircleIcon
						fontSize='small'
						color='success'
					/>
				),
				label: '已通过',
			};
		case 'failed':
			return {
				icon: (
					<ErrorIcon
						fontSize='small'
						color='error'
					/>
				),
				label: '已失败',
			};
		case 'stopped':
			return {
				icon: (
					<StopCircleIcon
						fontSize='small'
						color='warning'
					/>
				),
				label: '已停止',
			};
		default:
			return {
				icon: (
					<HourglassTopIcon
						fontSize='small'
						color='info'
					/>
				),
				label: '测试中',
			};
	}
};

export const RunHistoryList: FC = () => {
	const { runs, currentRunContext, currentRunId, setCurrentRunId } = useContext(RunContext);
	const isRunning = currentRunContext.status === 'running';

	if (runs.length === 0) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
				<Typography
					variant='body2'
					sx={{ color: 'text.secondary' }}
				>
					暂无运行记录
				</Typography>
			</Box>
		);
	}

	return (
		<List disablePadding>
			{runs.map(run => {
				const meta = getStatusMeta(run.status);
				return (
					<ListItem
						key={run.id}
						disablePadding
					>
						<ListItemButton
							selected={run.id === currentRunId}
							disabled={isRunning}
							onClick={() => setCurrentRunId(run.id === currentRunId ? null : run.id)}
						>
							<ListItemIcon sx={{ minWidth: 32 }}>{meta.icon}</ListItemIcon>
							<ListItemText
								primary={
									run.status === 'running'
										? `#${run.id} ${meta.label}`
										: `#${run.id} ${meta.label}（${run.passedSteps}/${run.totalSteps}）`
								}
								secondary={
									run.status === 'running'
										? '运行中...'
										: `${new Date(run.startedAt).toLocaleString('zh-CN')} / ${run.durationMs ? (run.durationMs / 1000).toFixed(1) : '--'}s`
								}
							/>
						</ListItemButton>
					</ListItem>
				);
			})}
		</List>
	);
};
