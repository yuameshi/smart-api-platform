import { Box, Tabs, Tab } from '@mui/material';
import { FC, useState } from 'react';
import { AuthTab } from './AuthTab';
import { BodyTab } from './BodyTab';
import { HeadersTab } from './HeadersTab';
import { ParamsTab } from './ParamsTab';
import type { EndpointDraft } from '../draft';

export type TabKey = 'params' | 'body' | 'headers' | 'auth';

type Props = {
	draft: EndpointDraft;
	setDraft: (update: (prev: EndpointDraft) => EndpointDraft) => void;
};

export const RequestTabs: FC<Props> = ({ draft, setDraft }) => {
	const [tab, setTab] = useState<TabKey>('params');

	return (
		<>
			<Box sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}>
				<Tabs
					value={tab}
					onChange={(_, value: TabKey) => setTab(value)}
				>
					<Tab
						value='params'
						label='参数'
					/>
					<Tab
						value='body'
						label='Body'
					/>
					<Tab
						value='headers'
						label='请求头'
					/>
					<Tab
						value='auth'
						label='认证'
					/>
				</Tabs>
			</Box>
			<Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
				{tab === 'params' && (
					<ParamsTab
						draft={draft}
						setDraft={setDraft}
					/>
				)}
				{tab === 'body' && (
					<BodyTab
						draft={draft}
						setDraft={setDraft}
					/>
				)}
				{tab === 'headers' && (
					<HeadersTab
						draft={draft}
						setDraft={setDraft}
					/>
				)}
				{tab === 'auth' && (
					<AuthTab
						draft={draft}
						setDraft={setDraft}
					/>
				)}
			</Box>
		</>
	);
};
