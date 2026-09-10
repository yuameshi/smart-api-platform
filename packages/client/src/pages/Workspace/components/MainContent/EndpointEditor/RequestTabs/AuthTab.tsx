import { Box, MenuItem, Select, TextField, Typography, InputLabel, FormControl } from '@mui/material';
import type { AuthConfig } from 'shared';
import type { EndpointDraft } from '../draft';

type Props = {
	draft: EndpointDraft;
	setDraft: (update: (prev: EndpointDraft) => EndpointDraft) => void;
};

type AuthKind = 'none' | 'bearer' | 'basic';

export const AuthTab = ({ draft, setDraft }: Props) => {
	const kind = draft.auth.kind;
	// 切换丢弃旧数据
	const setKind = (k: AuthKind) => {
		if (k === 'bearer') setDraft(prev => ({ ...prev, auth: { kind: 'bearer', token: '' } }));
		else if (k === 'basic') setDraft(prev => ({ ...prev, auth: { kind: 'basic', username: '', password: '' } }));
		else setDraft(prev => ({ ...prev, auth: { kind: 'none' } }));
	};

	return (
		<Box sx={{ p: 2, maxWidth: 480 }}>
			<FormControl
				size='small'
				fullWidth
			>
				<InputLabel>认证方式</InputLabel>
				<Select<AuthKind>
					value={kind}
					onChange={e => setKind(e.target.value)}
					label='认证方式'
				>
					<MenuItem value='none'>无认证</MenuItem>
					<MenuItem value='bearer'>Bearer Token</MenuItem>
					<MenuItem value='basic'>Basic</MenuItem>
				</Select>
			</FormControl>

			{kind === 'bearer' && draft.auth.kind === 'bearer' && (
				<TextField
					size='small'
					fullWidth
					multiline
					label='Token'
					margin='normal'
					value={draft.auth.token}
					onChange={e =>
						setDraft(prev => {
							if (prev.auth.kind !== 'bearer') return prev;
							return { ...prev, auth: { kind: 'bearer', token: e.target.value } satisfies AuthConfig };
						})
					}
				/>
			)}

			{kind === 'basic' && draft.auth.kind === 'basic' && (
				<>
					<BasicField
						draft={draft}
						setDraft={setDraft}
						field='username'
						label='用户名'
					/>
					<BasicField
						draft={draft}
						setDraft={setDraft}
						field='password'
						label='密码'
					/>
				</>
			)}

			{kind === 'none' && <Typography sx={{ mt: 2 }}>此请求不使用认证</Typography>}
		</Box>
	);
};

const BasicField = ({
	draft,
	setDraft,
	field,
	label,
}: {
	draft: EndpointDraft;
	setDraft: Props['setDraft'];
	field: 'username' | 'password';
	label: string;
}) => {
	const value = draft.auth.kind === 'basic' ? draft.auth[field] : '';
	return (
		<TextField
			size='small'
			fullWidth
			label={label}
			margin='normal'
			value={value}
			onChange={e =>
				setDraft(prev => {
					if (prev.auth.kind !== 'basic') return prev;
					return { ...prev, auth: { ...prev.auth, [field]: e.target.value } };
				})
			}
		/>
	);
};
