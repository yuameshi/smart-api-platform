import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Snackbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { zhCN } from '@mui/x-data-grid/locales';
import type { PublicUser } from 'shared';
import { Layout } from '@/components/Layout';
import Title from '@/utils/Title';
import { listUsers } from '@/services/users';
import { UserFormDialog } from './UserFormDialog';
import { DeleteUserDialog } from './DeleteUserDialog';

export default function Users() {
	const [users, setUsers] = useState<PublicUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [snackbar, setSnackbar] = useState('');

	const [formOpen, setFormOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<PublicUser | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<PublicUser | null>(null);

	const loadUsers = useCallback(() => {
		listUsers()
			.then(data => {
				setUsers(data);
				setLoadError(null);
			})
			.catch(err => {
				setLoadError(err instanceof Error ? err.message : '获取用户列表失败');
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleOpenUserForm = (user: PublicUser | null) => {
		setEditingUser(user);
		setFormOpen(true);
	};

	const columns: GridColDef<PublicUser>[] = [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'username', headerName: '用户名', flex: 1, minWidth: 120 },
		{ field: 'email', headerName: '邮箱', flex: 1, minWidth: 200 },
		{
			field: 'isAdmin',
			headerName: '角色',
			width: 120,
			renderCell: params => (params.value ? '管理员' : '普通用户'),
		},
		{
			field: 'isActive',
			headerName: '状态',
			width: 120,
			renderCell: params => (params.value ? '已激活' : '已禁用'),
		},
		{
			field: 'createdAt',
			headerName: '注册时间',
			width: 190,
			renderCell: params => (params.value ? new Date(params.value).toLocaleString('zh-CN') : '未知'),
		},
		{
			field: 'actions',
			headerName: '操作',
			type: 'actions',
			width: 110,
			getActions: params => [
				<GridActionsCellItem
					key='edit'
					icon={<EditIcon />}
					label='编辑'
					onClick={() => handleOpenUserForm(params.row)}
				/>,
				<GridActionsCellItem
					key='delete'
					icon={<DeleteIcon />}
					label='删除'
					onClick={() => setDeleteTarget(params.row)}
				/>,
			],
		},
	];

	return (
		<Layout>
			<Title>用户管理</Title>
			<Box sx={{ minHeight: '70vh', px: 3, py: 2 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography
						variant='h5'
						component='h1'
					>
						用户管理
					</Typography>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Button
							startIcon={<RefreshIcon />}
							onClick={loadUsers}
						>
							刷新
						</Button>
						<Button
							variant='contained'
							startIcon={<AddIcon />}
							onClick={() => handleOpenUserForm(null)}
						>
							新增用户
						</Button>
					</Box>
				</Box>
				{loadError && (
					<Alert
						severity='error'
						sx={{ mb: 2 }}
					>
						{loadError}
					</Alert>
				)}
				<Box sx={{ height: '100%' }}>
					{loading ? (
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
								width: '100%',
							}}
						>
							<CircularProgress />
						</Box>
					) : (
						<DataGrid
							sx={{ flex: 1 }}
							rows={users}
							columns={columns}
							localeText={zhCN.components.MuiDataGrid.defaultProps.localeText}
							disableRowSelectionOnClick
						/>
					)}
				</Box>
				<UserFormDialog
					open={formOpen}
					user={editingUser}
					onClose={() => setFormOpen(false)}
					onSaved={loadUsers}
					setSnackbar={setSnackbar}
				/>
				<DeleteUserDialog
					setSnackbar={setSnackbar}
					deleteTarget={deleteTarget}
					setDeleteTarget={setDeleteTarget}
					onDeleteComplete={loadUsers}
				/>
				<Snackbar
					open={snackbar !== ''}
					autoHideDuration={2000}
					message={snackbar}
					onClose={() => setSnackbar('')}
					anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				/>
			</Box>
		</Layout>
	);
}
