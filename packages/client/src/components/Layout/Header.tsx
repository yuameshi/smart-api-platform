import { AppBar, IconButton, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router';
import { useAtomValue, useSetAtom } from 'jotai';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { tokenAtom } from '@/atoms/token';
import { userAtom } from '@/atoms/user';

export const LayoutHeader = () => {
	const navigate = useNavigate();
	const token = useAtomValue(tokenAtom);
	const user = useAtomValue(userAtom);
	const setToken = useSetAtom(tokenAtom);
	const setUser = useSetAtom(userAtom);

	const isLoggedIn = !!token;

	const handleLogout = () => {
		setToken(undefined);
		setUser(undefined);
		navigate('/login');
	};

	return (
		<AppBar
			position='static'
			color='primary'
		>
			<Toolbar>
				<IconButton
					size='large'
					edge='start'
					color='inherit'
					sx={{ ml: { md: 1, xs: 0 } }}
					aria-label={'回到首页'}
					onClick={() => navigate('/')}
				>
					<DataObjectIcon />
				</IconButton>
				<Typography
					variant='h6'
					component='div'
					sx={{ cursor: 'pointer', mr: 2 }}
					onClick={() => navigate('/')}
				>
					智能API交付链路自动化平台
				</Typography>
				<Box sx={{ flexGrow: 1 }} />
				<Box>
					{isLoggedIn ? (
						<>
							<Typography
								variant='body1'
								component='span'
								sx={{ mr: 2, color: 'inherit' }}
							>
								{user?.username ?? '用户'}
							</Typography>
							<Button
								color='inherit'
								onClick={handleLogout}
							>
								退出登录
							</Button>
						</>
					) : (
						<>
							<Button
								color='inherit'
								onClick={() => navigate('/login')}
							>
								登录
							</Button>
							<Button
								color='inherit'
								onClick={() => navigate('/register')}
							>
								注册
							</Button>
						</>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
};
