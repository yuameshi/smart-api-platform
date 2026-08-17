import { FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField } from '@mui/material';
import type { PublicUser } from 'shared';
import { createUser, updateUser } from '@/services/users';

interface UserFormData {
	username: string;
	email: string;
	password: string;
	isAdmin: boolean;
	isActive: boolean;
}

interface Props {
	open: boolean;
	/** 传入 null 表示新增用户，否则为编辑该用户 */
	user: PublicUser | null;
	onClose: () => void;
	onSaved: () => void;
	setSnackbar: (str: string) => void;
}

export const UserFormDialog: FC<Props> = ({ open, user, onClose, onSaved, setSnackbar }) => {
	const isEdit = user !== null;
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<UserFormData>({
		defaultValues: {
			username: user?.username ?? '',
			email: user?.email ?? '',
			password: '',
			isAdmin: user?.isAdmin ?? false,
			isActive: user?.isActive ?? true,
		},
	});

	useEffect(() => {
		if (open) {
			reset({
				username: user?.username ?? '',
				email: user?.email ?? '',
				password: '',
				isAdmin: user?.isAdmin ?? false,
				isActive: user?.isActive ?? true,
			});
		}
	}, [open, user, reset]);

	const handleRequestClose = () => {
		setErrorMsg(null);
		onClose();
	};

	const onSubmit = async (data: UserFormData) => {
		setLoading(true);
		setErrorMsg(null);

		try {
			if (isEdit) {
				await updateUser(user.id, {
					username: data.username,
					email: data.email,
					password: data.password.trim() ? data.password : undefined,
					isAdmin: data.isAdmin,
					isActive: data.isActive,
				});
			} else {
				await createUser({
					username: data.username,
					email: data.email,
					password: data.password,
					isAdmin: data.isAdmin,
					isActive: data.isActive,
				});
			}
			setSnackbar(isEdit ? '修改成功' : '创建成功');
			onSaved();
			onClose();
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : '操作失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleRequestClose}
			maxWidth='sm'
			fullWidth
		>
			<DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
			<DialogContent>
				{errorMsg && (
					<Alert
						severity='error'
						sx={{ mb: 2 }}
						onClose={() => setErrorMsg(null)}
					>
						{errorMsg}
					</Alert>
				)}
				<form
					id='user-form'
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<TextField
						{...register('username', {
							required: '请输入用户名',
							minLength: { value: 3, message: '用户名至少 3 个字符' },
						})}
						label='用户名'
						fullWidth
						margin='normal'
						error={!!errors.username}
						helperText={errors.username?.message}
						autoComplete='username'
						disabled={loading}
					/>

					<TextField
						{...register('email', {
							required: '请输入邮箱',
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
								message: '请输入有效的邮箱地址',
							},
						})}
						label='邮箱'
						fullWidth
						margin='normal'
						error={!!errors.email}
						helperText={errors.email?.message}
						autoComplete='email'
						disabled={loading}
					/>
					<TextField
						{...register(
							'password',
							isEdit
								? { validate: value => !value || value.length >= 6 || '密码至少 6 个字符' }
								: {
										required: '请输入密码',
										minLength: { value: 6, message: '密码至少 6 个字符' },
									},
						)}
						label={isEdit ? '重置密码' : '密码'}
						type='password'
						fullWidth
						margin='normal'
						placeholder={isEdit ? '留空则不修改' : undefined}
						error={!!errors.password}
						helperText={errors.password?.message}
						autoComplete='new-password'
						disabled={loading}
					/>
					<Controller
						name='isAdmin'
						control={control}
						render={({ field }) => (
							<FormControlLabel
								control={
									<Switch
										checked={field.value}
										onChange={e => field.onChange(e.target.checked)}
										disabled={loading}
									/>
								}
								label='管理员权限'
							/>
						)}
					/>
					<Controller
						name='isActive'
						control={control}
						render={({ field }) => (
							<FormControlLabel
								control={
									<Switch
										checked={field.value}
										onChange={e => field.onChange(e.target.checked)}
										disabled={loading}
									/>
								}
								label='账号激活'
							/>
						)}
					/>
				</form>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button
					onClick={handleRequestClose}
					disabled={loading}
				>
					取消
				</Button>
				<Button
					type='submit'
					form='user-form'
					variant='contained'
					disabled={loading}
				>
					保存
				</Button>
			</DialogActions>
		</Dialog>
	);
};
