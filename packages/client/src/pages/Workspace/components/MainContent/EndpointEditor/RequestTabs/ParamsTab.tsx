import { useMemo } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { KeyValueTable } from '@/components/KeyValueTable';
import { getPathParams, type EndpointDraft } from '../draft';
import { KeyValueEntry } from 'shared';

type Props = {
	draft: EndpointDraft;
	setDraft: (update: (prev: EndpointDraft) => EndpointDraft) => void;
};

export const ParamsTab = ({ draft, setDraft }: Props) => {
	// 实时检测URL变化提取路径参数
	const pathParamKeys = useMemo(() => getPathParams(draft.path), [draft.path]);

	const updatePathParam = (name: string, patch: Partial<Omit<KeyValueEntry, 'key'>>) =>
		setDraft(prev => ({
			...prev,
			pathParamEntries: {
				...prev.pathParamEntries,
				[name]: Object.assign(
					{
						// 先补齐所有属性（新行）
						value: '',
						active: true,
					},
					prev.pathParamEntries[name],
					patch,
				),
			},
		}));

	return (
		<Box sx={{ p: 2, overflow: 'auto' }}>
			<Typography variant='h6'>路径参数</Typography>
			{pathParamKeys.length === 0 && <Typography variant='body2'>URL中没有路径参数</Typography>}
			{pathParamKeys.map(name => (
				<Box
					key={name}
					sx={{ display: 'flex', gap: 1, my: 1 }}
				>
					<TextField
						size='small'
						disabled
						value={name}
						sx={{ width: 500 }}
					/>
					<TextField
						size='small'
						fullWidth
						placeholder='值'
						value={draft.pathParamEntries[name]?.value ?? ''}
						onChange={e => updatePathParam(name, { value: e.target.value })}
					/>
					<TextField
						size='small'
						fullWidth
						placeholder='描述'
						value={draft.pathParamEntries[name]?.description ?? ''}
						onChange={e => updatePathParam(name, { description: e.target.value })}
					/>
				</Box>
			))}
			<Typography
				variant='h6'
				sx={{ mt: 1 }}
			>
				查询参数
			</Typography>
			<KeyValueTable
				rows={draft.params}
				onChange={rows =>
					setDraft(prev => ({
						...prev,
						params: rows,
					}))
				}
				keyPlaceholder='参数名'
			/>
		</Box>
	);
};
