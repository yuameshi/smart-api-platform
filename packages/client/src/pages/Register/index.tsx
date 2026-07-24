import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSetAtom } from 'jotai';
import { useNavigate, Link as RouterLink } from 'react-router';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Link, TextField, Typography } from '@mui/material';

import api from '@/services/api';
import { tokenAtom } from '@/atoms/token';
import { userAtom } from '@/atoms/user';
import { Layout } from '@/components/Layout';
import Title from '@/utils/Title';

interface RegisterFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export default function Register() {
	const navigate = useNavigate();
	const setToken = useSetAtom(tokenAtom);
	const setUser = useSetAtom(userAtom);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegisterFormData>();

	const password = watch('password');

	const onSubmit = async (data: RegisterFormData) => {
		setLoading(true);
		setErrorMsg('');
		try {
			const res = (await api.post('/auth/register', {
				username: data.username,
				email: data.email,
				password: data.password,
			})) as { access_token?: string; user: UserBrief };

			setToken(res.access_token);
			setUser(res.user);
			navigate('/');
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : '注册失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout>
			<Title>注册</Title>
			<Container maxWidth='sm'>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						mt: 4,
					}}
				>
					<Card sx={{ width: 540, maxWidth: '90vw' }}>
						<CardContent sx={{ p: 4 }}>
							<Typography
								variant='h4'
								align='center'
								gutterBottom
							>
								注册
							</Typography>

							{errorMsg && (
								<Alert
									severity='error'
									sx={{ mb: 2 }}
								>
									{errorMsg}
								</Alert>
							)}

							<Box
								component='form'
								onSubmit={handleSubmit(onSubmit)}
								noValidate
								sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
							>
								<TextField
									{...register('username', {
										required: '请输入用户名',
										minLength: { value: 3, message: '用户名至少 3 个字符' },
									})}
									label='用户名'
									sx={{ width: '100%', maxWidth: '480px', my: 1 }}
									error={!!errors.username}
									helperText={errors.username?.message}
									autoComplete='username'
									autoFocus
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
									type='email'
									sx={{ width: '100%', maxWidth: '480px', my: 1 }}
									error={!!errors.email}
									helperText={errors.email?.message}
									autoComplete='email'
									disabled={loading}
								/>

								<TextField
									{...register('password', {
										required: '请输入密码',
										minLength: { value: 6, message: '密码至少 6 个字符' },
									})}
									label='密码'
									type='password'
									sx={{ width: '100%', maxWidth: '480px', my: 1 }}
									error={!!errors.password}
									helperText={errors.password?.message}
									autoComplete='new-password'
									disabled={loading}
								/>

								<TextField
									{...register('confirmPassword', {
										required: '请确认密码',
										validate: value => value === password || '两次输入的密码不一致',
									})}
									label='确认密码'
									type='password'
									sx={{ width: '100%', maxWidth: '480px', my: 1 }}
									error={!!errors.confirmPassword}
									helperText={errors.confirmPassword?.message}
									autoComplete='new-password'
									disabled={loading}
								/>

								<Button
									type='submit'
									variant='contained'
									fullWidth
									size='large'
									disabled={loading}
									sx={{ mt: 3, mb: 2, maxWidth: '480px' }}
								>
									{loading ? <CircularProgress size={24} /> : '注册'}
								</Button>
							</Box>

							<Typography
								align='center'
								sx={{ mt: 1 }}
							>
								已有账号？{' '}
								<Link
									component={RouterLink}
									to='/login'
								>
									立即登录
								</Link>
							</Typography>
						</CardContent>
					</Card>
				</Box>
			</Container>
		</Layout>
	);
}
