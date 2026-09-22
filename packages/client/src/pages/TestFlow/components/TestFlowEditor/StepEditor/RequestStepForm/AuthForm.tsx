import { Box, MenuItem, TextField, Typography } from '@mui/material';
import type { AuthConfig } from 'shared';

type Props = {
	auth: AuthConfig;
	onChange: (auth: AuthConfig) => void;
};

export const AuthForm = ({ auth, onChange }: Props) => {
	const setAuthKind = (kind: AuthConfig['kind']) => {
		if (kind === 'bearer')
			onChange({
				kind: 'bearer',
				token: auth.kind === 'bearer' ? auth.token : '',
			});
		else if (kind === 'basic')
			onChange({
				kind: 'basic',
				username: auth.kind === 'basic' ? auth.username : '',
				password: auth.kind === 'basic' ? auth.password : '',
			});
		else onChange({ kind: 'none' });
	};

	return (
		<Box>
			<Typography variant='h5'>认证</Typography>
			<Box
				sx={{
					display: 'flex',
					gap: 1,
					alignItems: 'center',
					pt: 2,
				}}
			>
				<TextField
					select
					size='small'
					label='认证方式'
					sx={{ minWidth: 150 }}
					value={auth.kind}
					onChange={event => setAuthKind(event.target.value as AuthConfig['kind'])}
				>
					<MenuItem value='none'>无</MenuItem>
					<MenuItem value='bearer'>Bearer Token</MenuItem>
					<MenuItem value='basic'>Basic</MenuItem>
				</TextField>

				{auth.kind === 'bearer' && (
					<TextField
						size='small'
						fullWidth
						label='Token'
						value={auth.token}
						onChange={event => onChange({ kind: 'bearer', token: event.target.value })}
					/>
				)}

				{auth.kind === 'basic' && (
					<>
						<TextField
							size='small'
							fullWidth
							label='用户名'
							value={auth.username}
							onChange={event =>
								onChange({
									kind: 'basic',
									username: event.target.value,
									password: auth.password,
								})
							}
						/>
						<TextField
							size='small'
							type='password'
							fullWidth
							label='密码'
							value={auth.password}
							onChange={event =>
								onChange({
									kind: 'basic',
									username: auth.username,
									password: event.target.value,
								})
							}
						/>
					</>
				)}
			</Box>
		</Box>
	);
};
