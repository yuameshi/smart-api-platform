import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, Snackbar } from '@mui/material';
import { useAtomValue, useSetAtom } from 'jotai';
import type { PublicUser } from 'shared';
import api from '@/services/api';
import { userAtom } from '@/atoms/user';

interface ProfileFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface Props {
	open: boolean;
	onClose: () => void;
}

export const ProfileSettingsDialog = ({ open, onClose }: Props) => {
	const user = useAtomValue(userAtom);
	const setUser = useSetAtom(userAtom);

	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [toastMsg, setToastMsg] = useState('');
	const {
		register,
		handleSubmit,
		reset,
		getValues,
		formState: { errors },
	} = useForm<ProfileFormData>({
		defaultValues: {
			username: user?.username ?? '',
			email: user?.email ?? '',
			password: '',
			confirmPassword: '',
		},
	});

	const resetForm = () => {
		setErrorMsg(null);
		reset({
			username: user?.username ?? '',
			email: user?.email ?? '',
			password: '',
			confirmPassword: '',
		});
	};

	const handleRequestClose = () => {
		resetForm();
		onClose();
	};

	const onSubmit = async (data: ProfileFormData) => {
		setLoading(true);
		setErrorMsg(null);

		try {
			const res = (await api.patch('/user/profile', {
				username: data.username,
				email: data.email,
				// 密码留空则不修改
				password: data.password.trim() ? data.password : undefined,
			})) as PublicUser;

			setUser(res);
			reset({
				username: res.username,
				email: res.email,
				password: '',
				confirmPassword: '',
			});
			setToastMsg('修改成功');
			onClose();
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : '修改失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Dialog
				open={open}
				onClose={handleRequestClose}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>修改个人设置</DialogTitle>
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
						id='profile-settings-form'
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
							{...register('password', {
								validate: value => !value || value.length >= 6 || '密码至少 6 个字符',
							})}
							label='密码'
							type='password'
							fullWidth
							margin='normal'
							placeholder='留空则不修改'
							error={!!errors.password}
							helperText={errors.password?.message}
							autoComplete='new-password'
							disabled={loading}
						/>

						<TextField
							{...register('confirmPassword', {
								validate: value => value === getValues('password') || '两次输入的密码不一致',
							})}
							label='确认密码'
							type='password'
							fullWidth
							margin='normal'
							placeholder='留空则不修改'
							error={!!errors.confirmPassword}
							helperText={errors.confirmPassword?.message}
							autoComplete='new-password'
							disabled={loading}
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
						form='profile-settings-form'
						variant='contained'
						disabled={loading}
					>
						保存
					</Button>
				</DialogActions>
			</Dialog>
			<Snackbar
				open={toastMsg !== ''}
				autoHideDuration={2000}
				message={toastMsg}
				onClose={() => setToastMsg('')}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			/>
		</>
	);
};
