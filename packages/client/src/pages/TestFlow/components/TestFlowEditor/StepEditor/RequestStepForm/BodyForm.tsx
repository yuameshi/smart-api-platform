import { lazy, Suspense, useState } from 'react';
import { Box, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { RequestBody } from 'shared';
import { KeyValueTable } from '@/components/KeyValueTable';
const MonacoEditor = lazy(() => import('@/components/MonacoEditor'));

const BODY_KINDS = ['none', 'raw', 'formUrlEncoded'] as const;
const BODY_KIND_LABELS: Record<RequestBody['kind'], string> = {
	none: '无',
	raw: 'JSON',
	formUrlEncoded: 'x-www-form-urlencoded',
};

type Props = {
	body: RequestBody;
	onChange: (body: RequestBody) => void;
};

export const BodyForm = ({ body, onChange }: Props) => {
	const [jsonError, setJsonError] = useState<string | null>(null);

	const setBodyKind = (kind: RequestBody['kind']) => {
		setJsonError(null);
		if (kind === 'raw') onChange({ kind: 'raw', contentType: 'application/json', raw: '' });
		else if (kind === 'formUrlEncoded') onChange({ kind: 'formUrlEncoded', entries: [] });
		else onChange({ kind: 'none' });
	};

	const validateJson = (raw: string) => {
		try {
			JSON.parse(raw);
			setJsonError(null);
		} catch (error) {
			setJsonError(error instanceof Error ? error.message : '未知错误');
		}
	};

	return (
		<Box>
			<Typography variant='h5'>请求体</Typography>
			<ToggleButtonGroup
				exclusive
				size='small'
				value={body.kind}
				onChange={(_event, value: RequestBody['kind'] | null) => {
					if (value !== null) setBodyKind(value);
				}}
			>
				{BODY_KINDS.map(kind => (
					<ToggleButton
						key={kind}
						value={kind}
					>
						{BODY_KIND_LABELS[kind]}
					</ToggleButton>
				))}
			</ToggleButtonGroup>

			{body.kind === 'raw' && (
				<Box sx={{ mt: 2 }}>
					<Suspense
						fallback={
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									py: 4,
								}}
							>
								<CircularProgress />
							</Box>
						}
					>
						<MonacoEditor
							value={body.raw}
							onChange={raw =>
								onChange({
									kind: 'raw',
									contentType: 'application/json',
									raw,
								})
							}
							onBlur={() => validateJson(body.raw)}
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

			{body.kind === 'formUrlEncoded' && (
				<KeyValueTable
					rows={body.entries}
					keyPlaceholder='字段名'
					onChange={entries => onChange({ kind: 'formUrlEncoded', entries })}
				/>
			)}
		</Box>
	);
};
