import { useContext, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import type { StepRunResult } from 'shared';
import { StepContext } from '../Contexts/StepContext';
import { RunContext, getRunSummary } from '../Contexts/RunContext';
import { RunStepResultCard } from './RunStepResultCard';
import { RunVariablesPanel } from './RunVariablesPanel';
import { Header } from './Header';

export const RunPanel = () => {
	const { currentRunContext } = useContext(RunContext);
	const { steps } = useContext(StepContext);
	// 正在运行/没运行的按当前步骤列出
	const live = currentRunContext.status === 'idle' || currentRunContext.status === 'running';

	// 正在测试的按照当前步骤展示
	const orderedSteps = useMemo(() => [...steps].sort((a, b) => a.order - b.order), [steps]);
	// 以步骤id为索引生成运行结果map，方便快速查找
	const runResults = useMemo(() => {
		const map: Record<number, StepRunResult> = {};
		for (const result of currentRunContext.results) map[result.stepId] = result;
		return map;
	}, [currentRunContext.results]);
	const runSummary = useMemo(() => getRunSummary(currentRunContext, steps), [currentRunContext, steps]);

	// 运行完成的测试按照测试记录里的步骤列出
	const snapshotResults = useMemo(() => {
		if (live) return [];
		return [...currentRunContext.results].sort((a, b) => a.order - b.order);
	}, [live, currentRunContext.results]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
			<Header />

			<Box
				sx={{
					flex: '1 1 auto',
					minHeight: 0,
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					overflow: 'hidden',
				}}
			>
				<Box
					sx={{
						flex: '1 1 60%',
						minWidth: 0,
						minHeight: 0,
						overflowY: 'auto',
						p: 1,
						display: 'flex',
						flexDirection: 'column',
						gap: 1,
					}}
				>
					{live ? (
						orderedSteps.length === 0 ? (
							<Box
								sx={{
									display: 'flex',
									flex: '1',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Typography variant='h5'>流程为空</Typography>
							</Box>
						) : (
							orderedSteps.map(step => (
								<RunStepResultCard
									key={step.id}
									order={step.order}
									name={step.name}
									result={runResults[step.id]}
									highlight={runSummary.currentStep?.id === step.id}
								/>
							))
						)
					) : (
						snapshotResults.map(result => (
							<RunStepResultCard
								key={result.stepId}
								order={result.order}
								name={result.name}
								result={result}
							/>
						))
					)}
				</Box>
				<Box
					sx={{
						flex: '1 1 40%',
						minWidth: 0,
						minHeight: 0,
						overflowY: 'auto',
						p: 1,
						borderLeft: theme => ({
							xs: 0,
							md: '1px solid ' + theme.palette.divider,
						}),
						borderTop: theme => ({
							xs: '1px solid ' + theme.palette.divider,
							md: 0,
						}),
					}}
				>
					<RunVariablesPanel vars={currentRunContext.vars} />
				</Box>
			</Box>
		</Box>
	);
};
