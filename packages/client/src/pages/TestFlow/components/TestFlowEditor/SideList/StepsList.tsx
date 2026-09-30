import { List, ListItem, Box, Tooltip, IconButton, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useContext, useState, type FC } from 'react';
import { PageContext } from '../../PageContext';
import { RunContext } from '../Contexts/RunContext';
import { StepContext } from '../Contexts/StepContext';
import { deleteTestStep, reorderTestSteps } from '@/services/testSteps';
import { freeDraftStep } from '../draft-steps';
import { TestStep } from 'shared';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import RuleIcon from '@mui/icons-material/Rule';
import SendIcon from '@mui/icons-material/Send';

// 批量根据数组下标更新TestStep的order值
const reindex = (steps: TestStep[]): TestStep[] =>
	steps.map((step, index): TestStep => (step.order === index ? step : { ...step, order: index }));

export const StepsList: FC = () => {
	const { testFlowId, currentStep, setCurrentStep, steps, setSteps } = useContext(StepContext);
	const { currentRunContext } = useContext(RunContext);
	const isRunningTest = currentRunContext.status === 'running';
	const { setSnackbar } = useContext(PageContext);
	const [loading, setLoading] = useState(false);
	const busy = loading || isRunningTest;

	// 与相邻行交换位置后刷新order值
	const moveStep = async (index: number, offset: -1 | 1) => {
		const targetIndex = index + offset;
		if (targetIndex < 0 || targetIndex >= steps.length) return;
		setLoading(true);
		const next = [...steps];
		// 交换位置
		[next[index], next[targetIndex]] = [next[targetIndex], next[index]];
		const reindexed = reindex(next);
		try {
			await reorderTestSteps(
				testFlowId,
				reindexed.map(step => step.id),
			);
			setSteps(reindexed);
		} catch (error) {
			setSnackbar(error instanceof Error ? error.message : '调整步骤顺序失败');
		} finally {
			setLoading(false);
		}
	};

	// 删除
	const handleDelete = async (index: number) => {
		try {
			const target = steps[index];
			if (target === undefined) return;
			setLoading(true);
			await deleteTestStep(testFlowId, target.id);
			const remaining = reindex(steps.filter((_, i) => i !== index));
			setSteps(remaining);
			freeDraftStep(target.id);
			if (currentStep?.id === target.id) setCurrentStep(remaining[index] ?? remaining[index - 1] ?? null);
			await reorderTestSteps(
				testFlowId,
				remaining.map(step => step.id),
			);
			setSnackbar('删除成功');
		} catch (error) {
			setSnackbar(error instanceof Error ? error.message : '删除步骤失败');
		} finally {
			setLoading(false);
		}
	};

	return (
		<List disablePadding>
			{steps.map((step, index) => {
				return (
					<ListItem
						key={step.id}
						disablePadding
						secondaryAction={
							<Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
								<Tooltip title='上移'>
									<IconButton
										size='small'
										aria-label='上移步骤'
										disabled={busy || index === 0}
										onClick={() => moveStep(index, -1)}
									>
										<ArrowUpwardIcon fontSize='small' />
									</IconButton>
								</Tooltip>
								<Tooltip title='下移'>
									<IconButton
										size='small'
										aria-label='下移步骤'
										disabled={busy || index === steps.length - 1}
										onClick={() => moveStep(index, 1)}
									>
										<ArrowDownwardIcon fontSize='small' />
									</IconButton>
								</Tooltip>
								<Tooltip title='删除'>
									<IconButton
										size='small'
										aria-label='删除步骤'
										disabled={busy}
										onClick={() => handleDelete(index)}
									>
										<DeleteIcon
											fontSize='small'
											color='error'
										/>
									</IconButton>
								</Tooltip>
							</Box>
						}
					>
						<ListItemButton
							selected={currentStep?.id === step.id}
							disabled={busy}
							onClick={() => setCurrentStep(step)}
						>
							<ListItemIcon sx={{ minWidth: 32 }}>
								{step.type === 'request' ? <SendIcon fontSize='small' /> : <RuleIcon fontSize='small' />}
							</ListItemIcon>
							<ListItemText primary={`${index + 1}. ${step.name}`} />
						</ListItemButton>
					</ListItem>
				);
			})}
		</List>
	);
};
