import { HeadersTable } from '@/pages/Workspace/components/MainContent/EndpointEditor/ResponseViewer/HeadersTable';
import { ResponseViewType, ResponseBar } from '@/pages/Workspace/components/MainContent/EndpointEditor/ResponseViewer/ResponseBar';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useState, useMemo, Suspense, lazy, FC } from 'react';
import { SentHttpResponse } from 'shared';
const MonacoEditor = lazy(() => import('@/components/MonacoEditor'));

type Props = {
	response: Extract<SentHttpResponse, { ok: true }>;
};

export const ResponseViewer: FC<Props> = ({ response }) => {
	const [view, setView] = useState<ResponseViewType>('body');
	// 能解析成JSON则格式化
	const { text, isJson } = useMemo(() => {
		try {
			return { text: JSON.stringify(JSON.parse(response.body), null, 2), isJson: true };
		} catch {
			return { text: response.body, isJson: false };
		}
	}, [response.body]);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				border: 1,
				borderColor: 'divider',
				borderRadius: 1,
				overflow: 'hidden',
			}}
		>
			<ResponseBar
				response={response}
				view={view}
				onViewChange={setView}
			/>
			<Box sx={{ maxHeight: 320, overflow: 'auto' }}>
				{view === 'headers' && <HeadersTable headers={response.headers} />}
				{view === 'body' &&
					(response.encoding === 'base64' ? (
						<Typography
							variant='body2'
							sx={{ p: 1, color: 'text.secondary' }}
						>
							二进制响应，共 {response.sizeBytes} 字节
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
								value={text}
								height='200px'
							/>
						</Suspense>
					))}
			</Box>
		</Box>
	);
};
