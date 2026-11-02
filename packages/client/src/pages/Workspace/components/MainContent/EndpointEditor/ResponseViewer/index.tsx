import { lazy, Suspense, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, CircularProgress, IconButton, Tab, Tabs, Typography } from '@mui/material';
import type { ResponseExample, SentHttpResponse } from 'shared';
import type { EndpointDraft } from '../draft';
import { ResponseBar, type ResponseViewType } from './ResponseBar';
import { HeadersTable } from './HeadersTable';
import { ResponseDefinition } from './ResponseDefinition';
import Add from '@mui/icons-material/Add';

const MonacoEditor = lazy(() => import('@/components/MonacoEditor'));

type Props = {
	draft: EndpointDraft;
	setDraft: (update: (prev: EndpointDraft) => EndpointDraft) => void;
};

type ResponseTabValue = 'actual' | number;

export const ResponseViewer = ({ draft, setDraft }: Props) => {
	const [tab, setTab] = useState<ResponseTabValue>('actual');

	const handleAddResponse = () => {
		const index = draft.responses.length;
		setDraft(prev => ({
			...prev,
			responses: [
				...prev.responses,
				{
					statusCode: 200,
					description: '',
					contentType: 'application/json',
					example: '{}',
				},
			],
		}));
		setTab(index);
	};

	const handleDeleteResponse = (index: number) => {
		setDraft(prev => ({
			...prev,
			responses: prev.responses.filter((_, responseIndex) => responseIndex !== index),
		}));
		if (tab === index) setTab('actual');
		else if (typeof tab === 'number' && tab > index) setTab(tab - 1);
	};

	const selectedResponse = typeof tab === 'number' ? draft.responses[tab] : undefined;

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				minHeight: 320,
			}}
		>
			<ResponseTabs
				tab={tab}
				responses={draft.responses}
				onChange={setTab}
				onAdd={handleAddResponse}
				onDelete={handleDeleteResponse}
			/>
			<Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
				{selectedResponse ? (
					<ResponseDefinition
						response={selectedResponse}
						index={tab as number}
						setDraft={setDraft}
					/>
				) : draft.sending ? (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '100%',
							p: 4,
						}}
					>
						<CircularProgress />
					</Box>
				) : draft.response === null ? (
					<Typography
						sx={{
							height: '100%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							p: 4,
						}}
					>
						请先发送请求
					</Typography>
				) : !draft.response.ok ? (
					<ErrorResponse response={draft.response} />
				) : (
					<SuccessView response={draft.response} />
				)}
			</Box>
		</Box>
	);
};

function ErrorResponse({ response }: { response: Extract<SentHttpResponse, { ok: false }> }) {
	let message = response.error.message;
	if (!message)
		switch (response.error.kind) {
			case 'timeout':
				message = '超时';
				break;
			case 'invalid-url':
				message = 'URL有误';
				break;
			default:
				message = '未知网络错误';
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

function ResponseTabs({
	tab,
	responses,
	onChange,
	onAdd,
	onDelete,
}: {
	tab: ResponseTabValue;
	responses: ResponseExample[];
	onChange: (tab: ResponseTabValue) => void;
	onAdd: () => void;
	onDelete: (index: number) => void;
}) {
	return (
		<Box
			sx={{
				px: 1,
				borderBottom: 1,
				borderColor: 'divider',
			}}
		>
			<Tabs
				value={tab}
				onChange={(_, value: ResponseTabValue | 'add') => {
					if (value === 'add') onAdd();
					else onChange(value);
				}}
			>
				<Tab
					value='actual'
					label='实际响应'
				/>
				{responses.map((response, index) => (
					<Tab
						key={index}
						component='div'
						value={index}
						label={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								{response.statusCode || '默认响应'}
								<IconButton
									aria-label={`删除${response.statusCode || ''}响应`}
									onClick={event => {
										event.stopPropagation();
										onDelete(index);
									}}
								>
									<CloseIcon sx={{ fontSize: 16 }} />
								</IconButton>
							</Box>
						}
					/>
				))}
				<Tab
					value='add'
					label={<Add />}
				/>
			</Tabs>
		</Box>
	);
}

function SuccessView({ response }: { response: Extract<SentHttpResponse, { ok: true }> }) {
	const contentType = response.contentType ?? '';
	const [view, setView] = useState<ResponseViewType>('body');
	let isJson = contentType.includes('json') && response.encoding === 'utf8';
	let body = response.body;
	try {
		body = JSON.stringify(JSON.parse(body), null, 2);
	} catch (error) {
		console.warn('解析JSON返回值失败', error);
		isJson = false;
	}

	return (
		<>
			<ResponseBar
				response={response}
				view={view}
				onViewChange={setView}
			/>
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
							value={body}
						/>
					</Suspense>
				))}
		</>
	);
}
