import { useContext, useState, type FC } from 'react';
import { Box, Button, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import type { CreateTestStepRequest, TestStep, TestStepType } from 'shared';
import { freeDraftStep, type StepRunStatus } from './draft-steps';
import { StepManagerContext } from './StepManagerContext';
import { createTestStep, deleteTestStep, reorderTestSteps } from '@/services/testSteps';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import RuleIcon from '@mui/icons-material/Rule';
import SendIcon from '@mui/icons-material/Send';
import { PageContext } from '../PageContext';

const getStatusColor = (status: StepRunStatus) => {
	switch (status) {
		case 'idle':
			return 'action';
		case 'running':
			return 'info';
		case 'success':
			return 'success';
		case 'failed':
			return 'error';
		case 'stopped':
			return 'warning';
		default:
			return 'action';
	}
};

// 批量根据数组下标更新TestStep的order值
const reindex = (steps: TestStep[]): TestStep[] =>
	steps.map((step, index): TestStep => (step.order === index ? step : { ...step, order: index }));

export const StepList: FC = () => {
	const { testFlowId, currentStep, setCurrentStep, steps, setSteps } = useContext(StepManagerContext);
	const {
		selectedControls: { selectedFlow },
	} = useContext(PageContext);
	const [loading, setLoading] = useState(false);
	// todo, 后续为执行时当前步骤的状态
	const stepRunStatus: StepRunStatus = 'idle';

	// 上移：与上一行交换位置后刷新order值
	const moveUp = async (index: number) => {
		setLoading(true);
		if (index === 0) return;
		const next = [...steps];
		// 交换位置
		[next[index - 1], next[index]] = [next[index], next[index - 1]];
		const reindexed = reindex(next);
		setSteps(reindexed);
		await reorderTestSteps(
			testFlowId,
			reindexed.map(step => step.id),
		);
		setLoading(false);
	};

	// 下移
	const moveDown = async (index: number) => {
		setLoading(true);
		if (index === steps.length - 1) return;
		const next = [...steps];
		[next[index], next[index + 1]] = [next[index + 1], next[index]];
		const reindexed = reindex(next);
		setSteps(reindexed);
		await reorderTestSteps(
			testFlowId,
			reindexed.map(step => step.id),
		);
		setLoading(false);
	};

	// 删除
	const handleDelete = async (index: number) => {
		setLoading(true);
		const deletedId = steps[index].id;
		await deleteTestStep(testFlowId, deletedId);
		const newSteps = steps.filter((_, i) => i !== index);
		const reindexed = reindex(newSteps);
		setSteps(reindexed);
		await reorderTestSteps(
			testFlowId,
			reindexed.map(step => step.id),
		);
		freeDraftStep(deletedId);
		if (currentStep?.id === deletedId) {
			setCurrentStep(reindexed[index] ?? reindexed[index - 1] ?? null);
		}
		setLoading(false);
	};

	// 追加(后端自动追加到末尾)
	const handleCreateStep = async (type: TestStepType) => {
		setLoading(true);
		const dto: CreateTestStepRequest =
			type === 'request'
				? {
						type: 'request',
						name: '新请求步骤',
						config: {
							method: 'GET',
							path: '',
							pathParams: [],
							params: [],
							headers: [],
							body: { kind: 'none' },
							auth: { kind: 'none' },
							extractions: [],
						},
					}
				: {
						type: 'assert',
						name: '新断言步骤',
						config: {
							left: { mode: 'literal', value: '' },
							operator: 'eq',
							expected: '',
						},
					};
		const created = await createTestStep(testFlowId, dto);
		freeDraftStep(created.id);
		setSteps([...steps, created]);
		setCurrentStep(created);
		setLoading(false);
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: 1, borderColor: 'divider' }}>
				<Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
					<Typography variant='h6'>{selectedFlow?.name || '未知测试流程'}</Typography>
					<Typography
						variant='body2'
						sx={{ color: 'text.secondary' }}
					>
						{selectedFlow?.description || '暂无描述'}
					</Typography>
				</Box>
			</Box>
			<Box sx={{ flex: '1 1 auto', overflow: 'auto' }}>
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
												disabled={loading || index === 0}
												onClick={() => moveUp(index)}
											>
												<ArrowUpwardIcon fontSize='small' />
											</IconButton>
										</Tooltip>
										<Tooltip title='下移'>
											<IconButton
												size='small'
												aria-label='下移步骤'
												disabled={loading || index === steps.length - 1}
												onClick={() => moveDown(index)}
											>
												<ArrowDownwardIcon fontSize='small' />
											</IconButton>
										</Tooltip>
										<Tooltip title='删除'>
											<IconButton
												size='small'
												aria-label='删除步骤'
												disabled={loading}
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
									disabled={loading}
									onClick={() => setCurrentStep(step)}
								>
									<ListItemIcon sx={{ minWidth: 32 }}>
										{step.type === 'request' ? (
											<SendIcon
												color={getStatusColor(stepRunStatus)}
												fontSize='small'
											/>
										) : (
											<RuleIcon
												color={getStatusColor(stepRunStatus)}
												fontSize='small'
											/>
										)}
									</ListItemIcon>
									<ListItemText primary={`${index + 1}. ${step.name}`} />
								</ListItemButton>
							</ListItem>
						);
					})}
				</List>
			</Box>
			<Box sx={{ display: 'flex', gap: 1, p: 1, borderTop: 1, borderColor: 'divider' }}>
				<Button
					size='small'
					disabled={loading}
					onClick={() => handleCreateStep('request')}
				>
					添加请求
				</Button>
				<Button
					size='small'
					disabled={loading}
					onClick={() => handleCreateStep('assert')}
				>
					添加断言
				</Button>
			</Box>
		</Box>
	);
};
