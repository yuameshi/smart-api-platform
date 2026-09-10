import { lazy, Suspense, useState } from 'react';
import { Box, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { KeyValueTable } from '../KeyValueTable';
import type { RequestBody } from 'shared';
import type { EndpointDraft } from '../draft';

const MonacoEditor = lazy(() => import('../MonacoEditor'));

type Props = {
	draft: EndpointDraft;
	setDraft: (update: (prev: EndpointDraft) => EndpointDraft) => void;
};

// 类型表
const KINDS = ['none', 'raw', 'formUrlEncoded'] as const;
const KIND_LABELS: Record<RequestBody['kind'], string> = {
	none: '无',
	raw: 'JSON',
	formUrlEncoded: 'x-www-form-urlencoded',
};

export const BodyTab = ({ draft, setDraft }: Props) => {
	const [jsonError, setJsonError] = useState<string | null>(null);

	// 换类型直接清空
	const setKind = (kind: RequestBody['kind']) => {
		setJsonError(null);
		if (kind === 'raw')
			setDraft(prev => ({
				...prev,
				body: {
					kind: 'raw',
					contentType: 'application/json',
					raw: '',
				},
			}));
		else if (kind === 'formUrlEncoded')
			setDraft(prev => ({
				...prev,
				body: {
					kind: 'formUrlEncoded',
					entries: [],
				},
			}));
		else setDraft(prev => ({ ...prev, body: { kind: 'none' } }));
	};

	const validateJson = (raw: string) => {
		try {
			JSON.parse(raw);
			setJsonError(null);
		} catch (errs) {
			setJsonError(errs instanceof Error ? errs.message : '未知错误');
		}
	};

	const kind = draft.body.kind;

	return (
		<Box sx={{ p: 1, height: '100%' }}>
			<ToggleButtonGroup
				exclusive
				size='small'
				value={kind}
				onChange={(_e, value: RequestBody['kind'] | null) => {
					if (value !== null) setKind(value);
				}}
			>
				{KINDS.map(kind => (
					<ToggleButton
						key={kind}
						value={kind}
					>
						{KIND_LABELS[kind]}
					</ToggleButton>
				))}
			</ToggleButtonGroup>

			{kind === 'none' && (
				<Typography
					sx={{
						py: 6,
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					此请求没有请求体
				</Typography>
			)}
			{kind === 'raw' && draft.body.kind === 'raw' && (
				<Box sx={{ mt: 2 }}>
					<Suspense
						fallback={
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
								<CircularProgress />
							</Box>
						}
					>
						<MonacoEditor
							value={draft.body.raw}
							onChange={value => {
								setDraft(prev => ({
									...prev,
									body: {
										kind: 'raw',
										contentType: 'application/json',
										raw: value,
									},
								}));
							}}
							onBlur={() => validateJson(draft.body.kind === 'raw' ? draft.body.raw : '')}
						/>
					</Suspense>
					{jsonError !== null && (
						<Typography
							variant='caption'
							sx={{ color: 'error.main' }}
						>
							JSON无效：{jsonError}
						</Typography>
					)}
				</Box>
			)}
			{kind === 'formUrlEncoded' && draft.body.kind === 'formUrlEncoded' && (
				<KeyValueTable
					rows={draft.body.entries}
					keyPlaceholder='字段名'
					onChange={entries =>
						setDraft(prev => ({
							...prev,
							body: {
								kind: 'formUrlEncoded',
								entries,
							},
						}))
					}
				/>
			)}
		</Box>
	);
};
