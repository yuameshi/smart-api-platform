import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useContext } from 'react';
import { PageUtilContext } from '../../PageUtil';

export const AddEndpointCard = () => {
	const { requestCreateOrEdit } = useContext(PageUtilContext);

	return (
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
	);
};
