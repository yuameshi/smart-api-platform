import { lazy, Suspense, useState } from 'react';
import { Avatar, Button, Menu, MenuItem, Divider, Box, Typography, CircularProgress } from '@mui/material';
import { useAtom, useSetAtom } from 'jotai';
import { tokenAtom } from '@/atoms/token';
import { userAtom } from '@/atoms/user';
import { useNavigate } from 'react-router';

const ProfileSettingsDialog = lazy(() => import('./ProfileSettingsDialog').then(m => ({ default: m.ProfileSettingsDialog })));

export const UserDropdown = () => {
	const navigate = useNavigate();
	const setToken = useSetAtom(tokenAtom);
	const [user, setUser] = useAtom(userAtom);

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleLogout = () => {
		setAnchorEl(null);
		setToken(undefined);
		setUser(undefined);
		navigate('/login');
	};

	const handleOpenSettings = () => {
		setAnchorEl(null);
		setDialogOpen(true);
	};

	return (
		<>
			<Button
				color='inherit'
				onClick={e => setAnchorEl(e.currentTarget)}
				sx={{ px: 2 }}
				startIcon={
					<Avatar sx={{ width: 28, height: 28, fontSize: '0.85rem' }}>{user?.username?.charAt(0)?.toUpperCase() ?? '?'}</Avatar>
				}
			>
				{user?.username ?? '未知用户'}
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<Box sx={{ px: 2, py: 1, pointerEvents: 'none' }}>
					<Typography
						variant='body1'
						sx={{ fontWeight: 'medium' }}
					>
						{user?.username ?? '未知用户'}
					</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{user?.email ?? ''}
					</Typography>
				</Box>
				<Divider />
				<MenuItem onClick={handleOpenSettings}>修改个人设置</MenuItem>
				<MenuItem onClick={handleLogout}>退出登录</MenuItem>
			</Menu>

			<Suspense fallback={<CircularProgress />}>
				<ProfileSettingsDialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
				/>
			</Suspense>
		</>
	);
};
