import { Typography, Box } from '@mui/material';

export const LayoutFooter: React.FC = () => {
	return (
		<Box
			component='footer'
			sx={{
				py: 3,
				textAlign: 'center',
				bgcolor: 'grey.100',
				mt: 'auto',
			}}
		>
			<Typography
				variant='body2'
				color='text.secondary'
			>
				© 2026 / All rights reserved.
			</Typography>
		</Box>
	);
};
