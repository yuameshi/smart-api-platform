import { AppBar, IconButton, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router';
import { useAtomValue } from 'jotai';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { tokenAtom } from '@/atoms/token';
import { UserDropdown } from './UserDropdown';

export const LayoutHeader = () => {
	const navigate = useNavigate();
	const token = useAtomValue(tokenAtom);

	const isLoggedIn = !!token;

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
						<UserDropdown />
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
