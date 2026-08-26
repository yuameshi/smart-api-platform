import { Typography, Container, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/atoms/user';
import { Layout } from '@/components/Layout';
import Title from '@/utils/Title';

export default function Home() {
	const navigate = useNavigate();
	const user = useAtomValue(userAtom);

	return (
		<Layout>
			<Title />
			<Container maxWidth='md'>
				<Box sx={{ textAlign: 'center', mt: 8 }}>
					<Typography
						variant='h3'
						component='h1'
						gutterBottom
					>
						智能API交付链路自动化平台
					</Typography>
					{user ? (
						<>
							<Typography
								variant='h5'
								color='text.secondary'
								sx={{ mt: 2 }}
							>
								欢迎回来，{user.username}
							</Typography>
							<Button
								variant='contained'
								size='large'
								sx={{ mt: 2 }}
								onClick={() => navigate('/projects')}
							>
								前往管理面板
							</Button>
						</>
					) : (
						<>
							<Typography
								variant='h5'
								color='text.secondary'
								sx={{ mt: 2 }}
							>
								请先登录
							</Typography>
							<Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
								<Button
									variant='contained'
									size='large'
									onClick={() => navigate('/login')}
								>
									登录
								</Button>
								<Button
									variant='outlined'
									size='large'
									onClick={() => navigate('/register')}
								>
									注册
								</Button>
							</Box>
						</>
					)}
				</Box>
			</Container>
		</Layout>
	);
}
