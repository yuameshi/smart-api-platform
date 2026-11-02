import { FC, lazy, Suspense, useState } from 'react';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import type { ResponseExample } from 'shared';
import type { EndpointDraft } from '../draft';

const MonacoEditor = lazy(() => import('@/components/MonacoEditor'));

type Props = {
	response: ResponseExample;
	index: number;
	setDraft: (update: (prev: EndpointDraft) => EndpointDraft) => void;
};

export const ResponseDefinition: FC<Props> = ({ response, index, setDraft }) => {
	const [jsonError, setJsonError] = useState<string | null>(null);

	const updateResponse = (update: Partial<ResponseExample>) => {
		setDraft(prev => ({
			...prev,
			responses: prev.responses.map((response, responseIndex) =>
				responseIndex === index
					? {
							...response,
							...update,
						}
					: response,
			),
		}));
	};

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
				<TextField
					label='状态码'
					type='number'
					size='small'
					value={response.statusCode}
					onChange={event => updateResponse({ statusCode: Number(event.target.value) })}
					sx={{ width: 120 }}
				/>
				<TextField
					label='类型'
					size='small'
					value={response.contentType}
					onChange={event => updateResponse({ contentType: event.target.value })}
					sx={{ width: 220 }}
				/>
				<TextField
					label='说明'
					size='small'
					value={response.description ?? ''}
					onChange={event => updateResponse({ description: event.target.value })}
					fullWidth
				/>
			</Box>
			<Box sx={{ position: 'relative' }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-start',
						gap: 2,
						mb: 1,
					}}
				>
					<Typography sx={{ fontWeight: 'medium' }}>响应示例</Typography>
					{jsonError && (
						<Typography
							variant='caption'
							color='error'
						>
							{jsonError}
						</Typography>
					)}
				</Box>
				<Suspense fallback={<CircularProgress />}>
					<MonacoEditor
						lang={response.contentType.includes('json') ? 'json' : 'text'}
						value={response.example}
						onChange={value => {
							updateResponse({ example: value });
							if (!response.contentType.includes('json')) {
								setJsonError(null);
								return;
							}
							try {
								JSON.parse(value);
								setJsonError(null);
							} catch (error) {
								setJsonError('JSON格式无效' + (error instanceof Error ? `: ${error.message}` : ''));
							}
						}}
					/>
				</Suspense>
			</Box>
		</Box>
	);
};
