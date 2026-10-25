import { useContext, useState } from 'react';
import type { FC } from 'react';
import { Box, Button, Chip, CircularProgress, Collapse, IconButton, Paper, Typography } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { ToolUIPart, DynamicToolUIPart } from 'ai';
import { ChatContext } from '../../contexts/ChatContext';

type ToolPart = ToolUIPart | DynamicToolUIPart;

function StateChip({ state }: { state: ToolPart['state'] }) {
	switch (state) {
		case 'input-streaming':
		case 'input-available':
			return (
				<Chip
					size='small'
					color='info'
					variant='outlined'
					icon={<CircularProgress size={12} />}
					label='调用中...'
				/>
			);
		case 'approval-requested':
			return (
				<Chip
					size='small'
					color='warning'
					label='待批准'
				/>
			);
		case 'approval-responded':
			return (
				<Chip
					size='small'
					color='info'
					variant='outlined'
					icon={<CircularProgress size={12} />}
					label='已批准，正在执行...'
				/>
			);
		case 'output-available':
			return (
				<Chip
					size='small'
					color='success'
					variant='outlined'
					label='成功'
				/>
			);
		case 'output-denied':
			return (
				<Chip
					size='small'
					variant='outlined'
					label='已拒绝'
				/>
			);
		case 'output-error':
			return (
				<Chip
					size='small'
					color='error'
					label='失败'
				/>
			);
	}
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
	return (
		<Box sx={{ mt: 1 }}>
			<Typography
				variant='caption'
				color='text.secondary'
			>
				{title}
			</Typography>
			<Box
				component='pre'
				sx={{
					m: 0,
					mt: 0.5,
					p: 1,
					borderRadius: 1,
					bgcolor: 'action.hover',
					fontSize: 11,
					maxHeight: 180,
					overflow: 'auto',
					whiteSpace: 'pre-wrap',
					wordBreak: 'break-all',
				}}
			>
				{JSON.stringify(value, null, 2)}
			</Box>
		</Box>
	);
}

export const ToolCallCard: FC<{ part: ToolPart }> = ({ part }) => {
	const { addToolApprovalResponse } = useContext(ChatContext);
	const output = part.state === 'output-available' ? part.output : undefined;
	const errorText = part.state === 'output-error' ? part.errorText : undefined;
	const hasDetail = part.input !== undefined || output !== undefined || errorText !== undefined;
	const [expanded, setExpanded] = useState(
		hasDetail
			? //
				part.state === 'approval-requested'
				? true
				: false
			: false,
	);

	return (
		<Paper
			variant='outlined'
			sx={{ my: 1, p: 1.5 }}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<BuildIcon
					fontSize='small'
					color='action'
				/>
				<Typography
					variant='body2'
					sx={{ flex: 1 }}
				>
					{(part.toolMetadata?.title as string) ?? 'name'}
				</Typography>
				<StateChip state={part.state} />
				{hasDetail && (
					<IconButton
						size='small'
						onClick={() => setExpanded(v => !v)}
						aria-label={expanded ? '收起详情' : '展开详情'}
					>
						{expanded ? <ExpandLessIcon fontSize='small' /> : <ExpandMoreIcon fontSize='small' />}
					</IconButton>
				)}
			</Box>

			<Collapse in={expanded && hasDetail}>
				{part.input !== undefined && (
					<JsonBlock
						title='参数'
						value={part.input}
					/>
				)}
				{output !== undefined && (
					<JsonBlock
						title='结果'
						value={output}
					/>
				)}
				{errorText !== undefined && (
					<Typography
						variant='caption'
						color='error'
						sx={{ display: 'block', mt: 1, whiteSpace: 'pre-wrap' }}
					>
						{errorText}
					</Typography>
				)}
			</Collapse>

			{part.state === 'approval-requested' && (
				<Box sx={{ mt: 1 }}>
					<Typography
						variant='caption'
						color='text.secondary'
					>
						模型正在请求执行一个或多个危险操作，请进行批准或拒绝。
					</Typography>
					<Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
						<Button
							size='small'
							variant='contained'
							color='error'
							onClick={() =>
								void addToolApprovalResponse({
									id: part.approval.id,
									approved: true,
								})
							}
						>
							批准
						</Button>
						<Button
							size='small'
							onClick={() =>
								void addToolApprovalResponse({
									id: part.approval.id,
									approved: false,
								})
							}
						>
							拒绝
						</Button>
					</Box>
				</Box>
			)}
		</Paper>
	);
};
