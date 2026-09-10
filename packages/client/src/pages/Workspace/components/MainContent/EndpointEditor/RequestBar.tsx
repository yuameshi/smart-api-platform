import { Box, Button, MenuItem, Select, TextField } from '@mui/material';
import type { HttpMethod, KeyValueEntry } from 'shared';
import type { EndpointDraft } from './draft';
import { METHOD_INFO } from '@/pages/Workspace/constants/method-colors';

type Props = {
	draft: EndpointDraft;
	setDraft: (update: (prev: EndpointDraft) => EndpointDraft) => void;
	dirty: boolean;
	onSend: () => void;
	onSave: () => void;
};

const METHODS = Object.keys(METHOD_INFO) as HttpMethod[];

export const RequestBar = ({ draft, setDraft, dirty, onSend, onSave }: Props) => {
	// 解析粘贴的URL，自动提取query params
	const handleUrlChange = (raw: string) => {
		const qIndex = raw.indexOf('?');
		if (qIndex === -1) {
			setDraft(prev => ({ ...prev, path: raw }));
			return;
		}
		const urlPart = raw.slice(0, qIndex);
		const sp = new URLSearchParams(raw.slice(qIndex + 1));
		const entries: KeyValueEntry[] = [...sp.entries()].map(([key, value]) => ({ key, value, active: true }));
		setDraft(prev => ({ ...prev, path: urlPart, params: [...prev.params, ...entries] }));
	};

	return (
		<Box sx={{ display: 'flex', gap: 1, p: 1, alignItems: 'center' }}>
			<Select
				value={draft.method}
				onChange={e => setDraft(prev => ({ ...prev, method: e.target.value as HttpMethod }))}
				renderValue={method => <span style={{ color: METHOD_INFO[method].color, fontWeight: 'bold' }}>{method}</span>}
				size='small'
				sx={{ minWidth: 120 }}
			>
				{METHODS.map(m => (
					<MenuItem
						key={m}
						value={m}
						sx={{ color: METHOD_INFO[m].color, fontWeight: 'bold' }}
					>
						{m}
					</MenuItem>
				))}
			</Select>
			<TextField
				size='small'
				fullWidth
				value={draft.path}
				onChange={e => handleUrlChange(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
				}}
				placeholder='/path'
			/>
			<Button
				variant='contained'
				onClick={onSend}
				disabled={draft.sending}
				loading={draft.sending}
			>
				发送
			</Button>
			<Button
				variant='contained'
				disabled={!dirty}
				onClick={onSave}
			>
				保存
			</Button>
		</Box>
	);
};
