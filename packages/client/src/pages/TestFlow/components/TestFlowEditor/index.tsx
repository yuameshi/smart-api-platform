import { Box } from '@mui/material';
import type { FC } from 'react';
import { StepEditor } from './StepEditor';
import { StepList } from './StepList';

export const TestFlowEditor: FC = () => {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh', flex: '1 1 auto', overflow: 'hidden' }}>
			<Box sx={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
				<Box sx={{ width: 280, flexShrink: 0, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
					<StepList />
				</Box>
				<Box sx={{ flex: '1 1 auto', minWidth: 0, overflow: 'auto' }}>
					<StepEditor />
				</Box>
			</Box>
		</Box>
	);
};
