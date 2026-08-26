import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const BackToProjectsCard = () => {
	const navigate = useNavigate();

	return (
		<Card sx={{ height: 250, width: 200 }}>
			<CardActionArea
				onClick={() => navigate('/projects')}
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
					<ArrowBackIcon sx={{ fontSize: 48 }} />
					<Typography sx={{ fontSize: 24 }}>返回项目列表</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	);
};
