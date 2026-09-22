import { Box, CircularProgress, Typography } from '@mui/material';
import type { FC } from 'react';
import type { TestFlow } from 'shared';
import { StepEditor } from './StepEditor';
import { StepList } from './StepList';
import { VariablesPanel } from './StepEditor/VariablesPanel';
import { StepManagerProvider } from './StepManagerContext';

type Props = {
	flow: TestFlow;
};

export const TestFlowEditor: FC<Props> = ({ flow }) => {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh', flex: '1 1 auto', overflow: 'hidden' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: 1, borderColor: 'divider' }}>
				<Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
					<Typography variant='h6'>{flow.name}</Typography>
					<Typography
						variant='body2'
						sx={{ color: 'text.secondary' }}
					>
						{flow.description || '暂无描述'}
					</Typography>
				</Box>
			</Box>
			<StepManagerProvider testFlowId={flow.id}>
				{({ loading, loadError }) =>
					loading === true ? (
						<Box sx={{ display: 'flex', flex: '1 1 auto', justifyContent: 'center', alignItems: 'center' }}>
							<CircularProgress />
						</Box>
					) : loadError !== null ? (
						<Box sx={{ display: 'flex', flex: '1 1 auto', justifyContent: 'center', alignItems: 'center' }}>
							<Typography
								variant='h6'
								color='error'
							>
								{loadError}
							</Typography>
						</Box>
					) : (
						<Box sx={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
							<Box sx={{ width: 280, flexShrink: 0, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
								<StepList />
							</Box>
							<Box sx={{ flex: '1 1 auto', minWidth: 0, overflow: 'auto' }}>
								<StepEditor />
								<VariablesPanel />
							</Box>
						</Box>
					)
				}
			</StepManagerProvider>
		</Box>
	);
};
