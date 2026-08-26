import { Box, Divider, Typography } from '@mui/material';
import { AddEndpointCard } from './AddEndpointCard';
import { AddFolderCard } from './AddFolderCard';
import { BackToProjectsCard } from './BackToProjectsCard';

export const Placeholder = () => {
	return (
		<Box
			sx={{
				height: '100%',
				width: '100%',
				flexDirection: 'column',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 2,
			}}
		>
			<Typography variant='h4'>选择一个接口</Typography>
			<Divider sx={{ width: '30%' }}>或</Divider>
			<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
				<BackToProjectsCard />
				<AddFolderCard />
				<AddEndpointCard />
			</Box>
		</Box>
	);
};
