import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Container, Card, CardContent, Typography, TextField, Button, Alert, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router';
import { useSetAtom } from 'jotai';
import type { AuthResponse } from 'shared';
import api from '@/services/api';
import { tokenAtom } from '@/atoms/token';
import { userAtom } from '@/atoms/user';
import { Layout } from '@/components/Layout';
import Title from '@/utils/Title';

interface LoginFormData {
	username: string;
	password: string;
}

export default function Login() {
	const navigate = useNavigate();
	const setToken = useSetAtom(tokenAtom);
	const setUser = useSetAtom(userAtom);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>();

	const onSubmit = async (data: LoginFormData) => {
		setLoading(true);
		setErrorMsg(null);

		try {
			const res = (await api.post('/auth/login', {
				username: data.username,
				password: data.password,
			})) as AuthResponse;

			setToken(res.access_token);
			setUser(res.user);
			navigate('/');
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : '登录失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout>
			<Title>登录</Title>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '60vh',
				}}
			>
				<Container maxWidth='sm'>
					<Card>
						<CardContent sx={{ p: 4 }}>
							<Typography
								variant='h4'
								align='center'
								gutterBottom
							>
								登录
							</Typography>

							{errorMsg && (
								<Alert
									severity='error'
									sx={{ mb: 2 }}
									onClose={() => setErrorMsg(null)}
								>
									{errorMsg}
								</Alert>
							)}

							<Box
								component='form'
								onSubmit={handleSubmit(onSubmit)}
								noValidate
							>
								<TextField
									{...register('username', { required: '请输入用户名' })}
									label='用户名'
									fullWidth
									margin='normal'
									error={!!errors.username}
									helperText={errors.username?.message}
									autoComplete='username'
									autoFocus
									disabled={loading}
								/>

								<TextField
									{...register('password', { required: '请输入密码' })}
									label='密码'
									type='password'
									fullWidth
									margin='normal'
									error={!!errors.password}
									helperText={errors.password?.message}
									autoComplete='current-password'
									disabled={loading}
								/>

								<Button
									type='submit'
									variant='contained'
									fullWidth
									size='large'
									sx={{ mt: 3, mb: 2 }}
									disabled={loading}
								>
									{loading ? '登录中...' : '登录'}
								</Button>

								<Typography align='center'>
									没有账号？
									<MuiLink
										component={Link}
										to='/register'
									>
										立即注册
									</MuiLink>
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Container>
			</Box>
		</Layout>
	);
}
