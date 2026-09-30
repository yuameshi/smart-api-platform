import { Box, Button, LinearProgress, Typography, Alert } from '@mui/material';
import { useContext, useMemo } from 'react';
import { StepContext } from '../Contexts/StepContext';
import { RunContext, getRunSummary } from '../Contexts/RunContext';

import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export const Header = () => {
	const { currentRunContext, runFlow, stopFlow } = useContext(RunContext);
	const { steps } = useContext(StepContext);
	const isRunning = currentRunContext.status === 'running';
	const runSummary = useMemo(() => getRunSummary(currentRunContext, steps), [currentRunContext, steps]);
	const progress = runSummary.total === 0 ? 0 : (runSummary.finished / runSummary.total) * 100;
	// 只在没运行时显示总耗时
	const totalDurationMs = currentRunContext.endedAt !== null && currentRunContext.startedAt > 0 ? currentRunContext.endedAt - currentRunContext.startedAt : null;

	const statusLine = useMemo(() => {
		switch (currentRunContext.status) {
			case 'running':
				return {
					severity: 'info' as const,
					text: runSummary.currentStep
						? `正在执行第 ${runSummary.currentStepIndex + 1}/${runSummary.total} 步：${runSummary.currentStep.name}`
						: '正在执行…',
				};
			case 'passed':
				return { severity: 'success' as const, text: `全部 ${runSummary.total} 个步骤测试通过` };
			case 'failed':
				return { severity: 'error' as const, text: currentRunContext.error ?? '测试失败' };
			case 'stopped':
				return { severity: 'warning' as const, text: `已在第 ${runSummary.finished}/${runSummary.total} 步停止` };
			default:
				return { severity: 'info' as const, text: '尚未运行，请先开始测试' };
		}
	}, [currentRunContext, runSummary]);

	return (
		<Box
			sx={{
				flex: '0 0 auto',
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
				p: 1,
				borderBottom: 1,
				borderColor: 'divider',
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 1,
					minWidth: '100%',
				}}
			>
				<Button
					variant='contained'
					startIcon={<PlayArrowIcon />}
					disabled={isRunning || steps.length === 0}
					onClick={() => void runFlow()}
				>
					运行
				</Button>
				<Button
					color='warning'
					startIcon={<StopIcon />}
					disabled={!isRunning}
					onClick={stopFlow}
				>
					停止
				</Button>
				<Box sx={{ flex: '1', display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
					<LinearProgress
						variant='determinate'
						value={progress}
						sx={{ flex: '1 1 auto' }}
					/>
					<Typography variant='body2'>
						{runSummary.finished}/{runSummary.total}
					</Typography>
					{totalDurationMs !== null && <Typography variant='body2'>耗时 {(totalDurationMs / 1000).toFixed(1)}s</Typography>}
				</Box>
			</Box>
			<Alert severity={statusLine.severity}>{statusLine.text}</Alert>
		</Box>
	);
};
