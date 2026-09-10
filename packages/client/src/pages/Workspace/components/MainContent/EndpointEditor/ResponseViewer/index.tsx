import { lazy, Suspense, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { SentHttpResponse } from 'shared';
import type { EndpointDraft } from '../draft';
import { ResponseBar, type ResponseViewType } from './ResponseBar';
import { HeadersTable } from './HeadersTable';

const MonacoEditor = lazy(() => import('../MonacoEditor'));

type Props = {
	draft: EndpointDraft;
};

export const ResponseViewer = ({ draft }: Props) => {
	if (draft.sending) {
		return (
			<Box
				sx={{
					flex: 1,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					p: 4,
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (draft.response === null)
		return (
			<Typography
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
					p: 4,
				}}
			>
				请先发送请求
			</Typography>
		);

	if (!draft.response.ok) {
		let message = draft.response.error.message;
		if (!message)
			switch (draft.response.error.kind) {
				case 'timeout':
					message = '超时';
					break;
				case 'invalid-url':
					message = 'URL有误';
					break;
				default:
					message = '未知网络错误';
					break;
			}

		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
					color: 'error.main',
					p: 4,
				}}
			>
				{message}
			</Box>
		);
	}

	return <SuccessView response={draft.response} />;
};

function SuccessView({ response }: { response: Extract<SentHttpResponse, { ok: true }> }) {
	const contentType = response.contentType ?? '';
	const isJson = contentType.includes('json') && response.encoding === 'utf8';
	const [view, setView] = useState<ResponseViewType>('body');

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				minHeight: 320,
			}}
		>
			<ResponseBar
				response={response}
				view={view}
				onViewChange={setView}
			/>
			<Box sx={{ flex: 1, overflow: 'auto' }}>
				{view === 'headers' && <HeadersTable headers={response.headers} />}
				{view === 'body' &&
					(response.encoding === 'base64' ? (
						<Typography
							variant='body2'
							color='text.secondary'
							sx={{ p: 1 }}
						>
							二进制响应，共{response.sizeBytes}字节
						</Typography>
					) : (
						<Suspense
							fallback={
								<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
									<CircularProgress />
								</Box>
							}
						>
							<MonacoEditor
								lang={isJson ? 'json' : 'text'}
								value={JSON.stringify(JSON.parse(response.body), null, 2)}
								height='100%'
							/>
						</Suspense>
					))}
			</Box>
		</Box>
	);
}
