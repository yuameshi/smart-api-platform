import { useContext, useMemo, useState, type FC } from 'react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import type { CreateTestStepRequest, TestStepType } from 'shared';
import { freeDraftStep } from '../draft-steps';
import { RunHistoryList } from './RunHistoryList';
import { UiContext } from '../Contexts/UiContext';
import { StepContext } from '../Contexts/StepContext';
import { RunContext, getRunSummary, type RunSummary } from '../Contexts/RunContext';
import { PageContext } from '../../PageContext';
import { createTestStep } from '@/services/testSteps';
import type { TestRunStatus } from 'shared';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { StepsList } from './StepsList';

const getTestRunLabel = (status: TestRunStatus, summary: RunSummary) => {
	const passedRatio = `${summary.passed}/${summary.total}`;
	switch (status) {
		case 'running':
			return { label: `测试中 ${passedRatio}`, color: 'info' as const };
		case 'passed':
			return { label: `已通过 ${passedRatio}`, color: 'success' as const };
		case 'failed':
			return { label: `已失败 ${passedRatio}`, color: 'error' as const };
		case 'stopped':
			return { label: `已停止 ${passedRatio}`, color: 'warning' as const };
		default:
			return { label: `未测试 ${passedRatio}`, color: 'primary' as const };
	}
};

export const SideList: FC = () => {
	const { panelView, setPanelView } = useContext(UiContext);
	const { testFlowId, setCurrentStep, steps, setSteps } = useContext(StepContext);
	// 运行测试相关
	const { runFlow, stopFlow, currentRunContext } = useContext(RunContext);
	const isRunningTest = currentRunContext.status === 'running';
	const runSummary = useMemo(() => getRunSummary(currentRunContext, steps), [currentRunContext, steps]);
	const {
		selectedControls: { selectedFlow },
		setSnackbar,
	} = useContext(PageContext);
	const [loading, setLoading] = useState(false);
	const busy = loading || isRunningTest;
	const runningLabel = getTestRunLabel(currentRunContext.status, runSummary);

	// 追加(后端自动追加到末尾)
	const handleCreateStep = async (type: TestStepType) => {
		setLoading(true);
		try {
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
			setSteps(prev => [...prev, created]);
			setCurrentStep(created);
		} catch (error) {
			setSnackbar(error instanceof Error ? error.message : '新增步骤失败');
		} finally {
			setLoading(false);
		}
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
				{/*  */}
				{panelView === 'run' ? <RunHistoryList /> : <StepsList />}
			</Box>
			<Box sx={{ display: 'flex', gap: 1, p: 1, borderTop: 1, borderColor: 'divider' }}>
				<Button
					size='small'
					disabled={busy || panelView === 'run'}
					onClick={() => handleCreateStep('request')}
				>
					添加请求
				</Button>
				<Button
					size='small'
					disabled={busy || panelView === 'run'}
					onClick={() => handleCreateStep('assert')}
				>
					添加断言
				</Button>
				<Button
					size='small'
					color={runningLabel.color}
					disabled={steps.length === 0}
					onClick={() => setPanelView(panelView === 'run' ? 'edit' : 'run')}
				>
					{runningLabel.label}
				</Button>
				<Tooltip title={isRunningTest ? '停止测试' : '开始测试'}>
					<IconButton
						size='small'
						aria-label={isRunningTest ? '停止测试' : '开始测试'}
						color={isRunningTest ? 'warning' : 'primary'}
						disabled={steps.length === 0}
						onClick={isRunningTest ? () => stopFlow() : () => runFlow()}
					>
						{isRunningTest ? <StopIcon fontSize='small' /> : <PlayArrowIcon fontSize='small' />}
					</IconButton>
				</Tooltip>
			</Box>
		</Box>
	);
};
