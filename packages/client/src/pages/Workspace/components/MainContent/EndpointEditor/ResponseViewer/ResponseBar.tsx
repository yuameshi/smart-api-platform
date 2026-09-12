import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { SentHttpResponse } from 'shared';

export type ResponseViewType = 'body' | 'headers';

type Props = {
	response: Extract<SentHttpResponse, { ok: true }>;
	view: ResponseViewType;
	onViewChange: (view: ResponseViewType) => void;
};

export const ResponseBar = ({ response, view, onViewChange }: Props) => {
	const statusColor =
		response.status >= 200 && response.status < 300
			? 'success'
			: response.status >= 300 && response.status < 400
				? 'warning'
				: 'error';

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				flexWrap: 'wrap',
				gap: 1,
				px: 1,
				py: 0.5,
				borderBottom: 1,
				borderColor: 'divider',
			}}
		>
			<Typography variant='caption'>
				<b>状态:</b>
				<Typography
					color={statusColor}
					variant='caption'
				>
					{response.status} {response.statusText}
				</Typography>
			</Typography>
			<Typography variant='caption'>
				<b>用时:</b>
				{response.durationMs}MS
			</Typography>
			<Typography variant='caption'>
				<b>体积:</b>
				{(response.sizeBytes / 1024).toFixed(2)}KB
			</Typography>
			{response.contentType && (
				<Typography variant='caption'>
					<b>MIME类型:</b>
					{response.contentType}
				</Typography>
			)}
			<Box sx={{ flex: 1 }} />
			<ToggleButtonGroup
				exclusive
				size='small'
				value={view}
				onChange={(_, v: ResponseViewType | null) => v !== null && onViewChange(v)}
			>
				<ToggleButton value='body'>Body</ToggleButton>
				<ToggleButton value='headers'>Headers</ToggleButton>
			</ToggleButtonGroup>
		</Box>
	);
};
