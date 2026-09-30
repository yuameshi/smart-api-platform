import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import type { StepRunResult, StepRunStatus } from 'shared';
import { ResponseViewer } from './ResponseViewer';
import { Assert } from './Assert';
import type { FC } from 'react';
import { VarTables } from './VarTables';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import StopCircleIcon from '@mui/icons-material/StopCircle';

const StatusIcon = ({ status }: { status: StepRunStatus }) => {
	switch (status) {
		case 'running':
			return <CircularProgress size={16} />;
		case 'success':
			return <CheckCircleIcon color='success' />;
		case 'failed':
			return <ErrorIcon color='error' />;
		case 'stopped':
			return <StopCircleIcon color='warning' />;
		default:
			return <HourglassEmptyIcon color='disabled' />;
	}
};

type Props = {
	order: number;
	name: string;
	result?: StepRunResult;
	// 是否高亮当前步骤
	highlight?: boolean;
};

export const RunStepResultCard: FC<Props> = ({ order, name, result, highlight = false }) => {
	return (
		<Accordion
			variant='outlined'
			disableGutters
			sx={{
				minWidth: 0,
				...(highlight
					? {
							borderColor: 'info.main',
							bgcolor: 'action.hover',
						}
					: {}),
			}}
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Stack
					direction='row'
					spacing={1}
					sx={{ alignItems: 'center', width: '100%', minWidth: 0 }}
				>
					<StatusIcon status={result?.status ?? 'idle'} />
					<Typography
						noWrap
						sx={{ minWidth: 0 }}
					>
						{`${order + 1}. ${name}`}
					</Typography>
					<Box sx={{ flex: '1 1 auto' }} />
					<Typography
						variant='caption'
						sx={{ color: 'text.secondary' }}
					>
						{result === undefined ? '未运行' : `${result.durationMs} MS`}
					</Typography>
				</Stack>
			</AccordionSummary>
			<AccordionDetails>
				{result === undefined ? (
					<Typography
						variant='body2'
						sx={{ color: 'text.secondary' }}
					>
						该步骤还没有运行
					</Typography>
				) : (
					<Stack spacing={1}>
						{result.request && (
							<Typography variant='body2'>
								{result.request.method} {result.request.path}
							</Typography>
						)}
						{result.error && <Alert severity='error'>{result.error}</Alert>}
						{/* Response Viewer */}
						{result.response !== undefined && result.response.ok && <ResponseViewer response={result.response} />}
						{result.response !== undefined && !result.response.ok && (
							<Alert severity='error'>网络错误：{result.response.error.message || result.response.error.kind}</Alert>
						)}
						{result.extracted !== undefined && result.extracted.length > 0 && <VarTables extractions={result.extracted} />}
						{/* Assertion */}
						{result.assertion && <Assert assertion={result.assertion} />}
					</Stack>
				)}
			</AccordionDetails>
		</Accordion>
	);
};
