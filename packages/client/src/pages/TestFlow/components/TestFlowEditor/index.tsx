import { useContext } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { FC } from 'react';
import { StepEditor } from './StepEditor';
import { RunPanel } from './RunPanel';
import { UiContext } from './Contexts/UiContext';
import { SideList } from './SideList';

export const TestFlowEditor: FC = () => {
	const { panelView, loading, loadError } = useContext(UiContext);

	if (loading || loadError !== null) {
		return (
			<Box sx={{ display: 'flex', flex: '1 1 auto', justifyContent: 'center', alignItems: 'center' }}>
				{loading && <CircularProgress />}
				{loadError !== null && (
					<Typography
						variant='h6'
						color='error'
					>
						{loadError}
					</Typography>
				)}
			</Box>
		);
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flex: '1 1 auto',
				minWidth: 0,
				minHeight: 0,
				overflowX: 'auto',
			}}
		>
			<Box sx={{ width: 280, flexShrink: 0, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
				<SideList />
			</Box>
			<Box sx={{ flex: '1 1 auto', minWidth: 320, minHeight: 0, overflow: 'auto' }}>
				{panelView === 'run' ? <RunPanel /> : <StepEditor />}
			</Box>
		</Box>
	);
};
