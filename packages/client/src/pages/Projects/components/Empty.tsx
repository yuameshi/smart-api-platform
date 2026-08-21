import { Box, Typography } from '@mui/material';

export const Empty = () => {
	return (
		<Box sx={{ textAlign: 'center', py: 6 }}>
			<Typography variant='h3'>无项目可显示</Typography>
		</Box>
	);
};
