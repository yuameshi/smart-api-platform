import { useForm } from 'react-hook-form';
import { Box, Container, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router';

// 登录表单数据类型
interface LoginFormData {
	username: string;
	password: string;
}

/**
 * 登录页面组件
 * 使用 MUI v5 + react-hook-form 实现表单验证和提交
 */
export default function Login() {
	const navigate = useNavigate();

	// 初始化 react-hook-form
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>();

	// 表单提交处理
	const onSubmit = (data: LoginFormData) => {
		console.log('登录信息:', data);
		navigate('/');
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#f5f5f5',
			}}
		>
			<Container maxWidth='sm'>
				<Card sx={{ boxShadow: 3 }}>
					<CardContent sx={{ p: 4 }}>
						{/* 页面标题 */}
						<Typography
							variant='h4'
							align='center'
							gutterBottom
						>
							登录
						</Typography>

						{/* 登录表单 */}
						<Box
							component='form'
							onSubmit={handleSubmit(onSubmit)}
							noValidate
						>
							{/* 用户名输入框 */}
							<TextField
								{...register('username', { required: '请输入用户名' })}
								label='用户名'
								fullWidth
								margin='normal'
								error={!!errors.username}
								helperText={errors.username?.message}
								autoComplete='username'
								autoFocus
							/>

							{/* 密码输入框 */}
							<TextField
								{...register('password', { required: '请输入密码' })}
								label='密码'
								type='password'
								fullWidth
								margin='normal'
								error={!!errors.password}
								helperText={errors.password?.message}
								autoComplete='current-password'
							/>

							{/* 登录按钮 */}
							<Button
								type='submit'
								variant='contained'
								fullWidth
								size='large'
								sx={{ mt: 3, mb: 2 }}
							>
								登录
							</Button>
						</Box>
					</CardContent>
				</Card>
			</Container>
		</Box>
	);
}
