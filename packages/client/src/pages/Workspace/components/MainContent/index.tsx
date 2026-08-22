import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import type { ApiEndpoint } from 'shared';
import { Placeholder } from './Placeholder';

type Props = {
	endpoint: ApiEndpoint | null;
};

export const MainContent: FC<Props> = ({ endpoint }) => {
	return (
		<Box sx={{ flex: '1 1 auto', overflow: 'auto', p: 2 }}>
			{endpoint ? (
				<Box sx={{ mt: 2 }}>
					<Typography variant='h6'>
						{endpoint.method} {endpoint.path}
					</Typography>
					<Typography
						variant='body2'
						sx={{ color: 'text.secondary', mt: 1 }}
					>
						{endpoint.summary}
					</Typography>
				</Box>
			) : (
				<Placeholder />
			)}
		</Box>
	);
};
