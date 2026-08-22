import { Box, Card, CardActionArea, CardContent, Divider, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useContext } from 'react';
import { PageUtilContext } from '../PageUtil';

export const Placeholder = () => {
	const { requestCreateOrEdit } = useContext(PageUtilContext);

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
				<Card sx={{ height: 250, width: 200 }}>
					<CardActionArea
						onClick={() => requestCreateOrEdit('create', 'endpoint', null)}
						sx={{
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<CardContent
							sx={{
								flexDirection: 'column',
								display: 'flex',
								gap: 2,
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<AddIcon sx={{ fontSize: 48 }} />
							<Typography sx={{ fontSize: 24 }}>新建接口</Typography>
						</CardContent>
					</CardActionArea>
				</Card>
			</Box>
		</Box>
	);
};
