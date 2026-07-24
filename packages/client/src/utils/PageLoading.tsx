import { Box, CircularProgress } from '@mui/material';

export default function PageLoading() {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
			}}
		>
			<CircularProgress />
		</Box>
	);
}
