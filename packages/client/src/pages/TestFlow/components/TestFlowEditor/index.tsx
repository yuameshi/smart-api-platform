import { Box, Typography } from '@mui/material';
import type { FC } from 'react';
import type { TestFlow } from 'shared';

type Props = {
	flow: TestFlow;
};

export const TestFlowEditor: FC<Props> = ({ flow }) => {
	return (
		<Box
			sx={{
				flex: '1 1 auto',
				minWidth: 0,
				p: 3,
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
			}}
		>
			<Typography variant='h5'>{flow.name}</Typography>
			<Typography>{flow.description}</Typography>
		</Box>
	);
};

export default TestFlowEditor;
