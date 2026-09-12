import { useContext, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { useAtom } from 'jotai';
import type { FC } from 'react';
import type { ApiEndpoint, SendHttpRequestRequest } from 'shared';
import { PageUtilContext } from '../../PageUtil';
import { updateEndpointContent } from '@/services/endpoints';
import { sendHttpRequest } from '@/services/httpRequests';
import { draftFamily, draftFromEndpoint, getPathParams, stringifyDraft } from './draft';
import { RequestBar } from './RequestBar';
import { ResponseViewer } from './ResponseViewer';
import { RequestTabs } from './RequestTabs';

type Props = {
	endpoint: ApiEndpoint;
};

export const EndpointEditor: FC<Props> = ({ endpoint }) => {
	const draftAtom = useMemo(() => draftFamily(endpoint.id), [endpoint.id]);
	const [draft, setDraft] = useAtom(draftAtom);
	const { endpointControls } = useContext(PageUtilContext);

	// 第一次进入端点初始化
	useEffect(() => {
		setDraft(prev => (prev.initialized ? prev : draftFromEndpoint(endpoint)));
	}, [endpoint, setDraft]);

	// 判断端点是否被修改过
	const dirty = useMemo(() => {
		if (!draft.initialized) return false;
		return stringifyDraft(draft) !== stringifyDraft(draftFromEndpoint(endpoint));
	}, [draft, endpoint]);

	// 通过URL生成pathParams
	const pathParamKeys = useMemo(() => getPathParams(draft.path), [draft.path]);

	const handleSend = async () => {
		// 替换path params
		setDraft(prev => ({ ...prev, sending: true }));
		let path = draft.path;
		for (const [key, entry] of Object.entries(draft.pathParamEntries)) {
			path = path.split(`{${key}}`).join(encodeURIComponent(entry.value));
		}
		const request: SendHttpRequestRequest = {
			projectId: endpoint.projectId,
			method: draft.method,
			path,
			params: draft.params,
			headers: draft.headers,
			body: draft.body,
			auth: draft.auth,
		};
		let response;
		try {
			response = await sendHttpRequest(request);
		} catch (errs) {
			console.error(errs);
			response = {
				ok: false,
				error: {
					kind: 'unknown',
					message: errs instanceof Error ? errs.message : '请求失败',
				},
			} as const;
		}
		setDraft(prev => ({ ...prev, sending: false, response }));
	};

	const handleSave = async () => {
		// 通过url动态生成pathParams
		const pathParams = pathParamKeys.map(k => {
			const entry = draft.pathParamEntries[k];
			return {
				key: k,
				value: entry?.value ?? '',
				active: entry?.active ?? true,
				...(entry?.description !== undefined && entry.description.trim() !== '' ? { description: entry.description } : {}),
			};
		});
		await updateEndpointContent(endpoint.id, {
			method: draft.method,
			path: draft.path,
			description: draft.description,
			pathParams,
			queryParams: draft.params,
			headers: draft.headers,
			requestBody: draft.body,
			auth: draft.auth,
		});
		// 实时刷新端点列表
		endpointControls.setEndpoints(list =>
			list.map(e =>
				e.id === endpoint.id
					? {
							...e,
							method: draft.method,
							path: draft.path,
							description: draft.description,
							queryParams: draft.params,
							headers: draft.headers,
							pathParams,
							requestBody: draft.body,
							auth: draft.auth,
						}
					: e,
			),
		);
		// 移除url中已删除的pathParamEntries
		setDraft(prev => ({
			...prev,
			pathParamEntries: Object.fromEntries(Object.entries(prev.pathParamEntries).filter(([k]) => pathParamKeys.includes(k))),
		}));
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflow: 'auto',
			}}
		>
			<Box
				sx={{
					minHeight: 320,
					flex: '0 0 auto',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'auto',
				}}
			>
				<RequestBar
					draft={draft}
					setDraft={setDraft}
					dirty={dirty}
					onSend={handleSend}
					onSave={handleSave}
				/>
				<RequestTabs
					draft={draft}
					setDraft={setDraft}
				/>
			</Box>
			<Box
				sx={{
					flex: 1,
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<ResponseViewer draft={draft} />
			</Box>
		</Box>
	);
};
