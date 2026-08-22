import { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router';
import type { ApiEndpoint, Folder, HttpMethod } from 'shared';
import { Layout } from '@/components/Layout';
import Title from '@/utils/Title';
import { FolderTree } from './components/FolderTree';
import { MainContent } from './components/MainContent';
import { PageUtilProvider } from './components/PageUtil';

const MOCK_PROJECT_NAME = '123132';

const MOCK_FOLDERS: Folder[] = [
	{ id: 1, projectId: 1, parentId: null, name: '111', createdAt: '', updatedAt: '' },
	{ id: 2, projectId: 1, parentId: 1, name: '222base111', createdAt: '', updatedAt: '' },
];

const MOCK_ENDPOINTS: ApiEndpoint[] = [
	{
		id: 1,
		projectId: 1,
		folderId: null,
		method: 'GET',
		path: '/health',
		summary: 'health',
	},
	{
		id: 2,
		projectId: 1,
		folderId: 2,
		method: 'POST',
		path: '/api/user/login',
		summary: 'login',
	},
	{
		id: 3,
		projectId: 1,
		folderId: 2,
		method: 'GET',
		path: '/api/user/{id}',
		summary: ' user detail',
	},
	{
		id: 4,
		projectId: 1,
		folderId: 1,
		method: 'GET',
		path: '/api/goods',
		summary: 'list goods',
	},
].map(endpoint => ({
	...endpoint,
	method: endpoint.method.toUpperCase() as ApiEndpoint['method'],
	description: null,
	tags: null,
	pathParams: null,
	queryParams: null,
	headers: null,
	requestBody: null,
	responses: null,
	version: null,
	createdAt: '',
	updatedAt: '',
}));

export type TreeNode = {
	id: string;
	label: string;
	kind: 'folder' | 'endpoint';
	method?: HttpMethod;
	rawId?: number;
	folderId?: number | null;
	parentId?: number | null;
	children?: TreeNode[];
};

// 建文件夹树
function buildTree(folders: Folder[], endpoints: ApiEndpoint[]): TreeNode[] {
	const folderNodes = new Map<number, TreeNode>();

	// 先为每个文件夹建TreeNode
	for (const f of folders) {
		folderNodes.set(f.id, {
			id: `folder-${f.id}`,
			label: f.name,
			kind: 'folder',
			rawId: f.id,
			parentId: f.parentId,
			children: [],
		});
	}

	// 将非根文件夹挂到对应的父文件夹
	for (const f of folders) {
		const node = folderNodes.get(f.id)!;
		if (f.parentId === null) continue;
		const parent = folderNodes.get(f.parentId);
		if (parent) parent.children!.push(node);
	}

	// 将根文件夹挂到根目录
	const root: TreeNode[] = [];
	for (const node of folderNodes.values()) {
		if (node.parentId === null) root.push(node);
	}

	// 端点挂到对应文件夹或项目根目录
	for (const e of endpoints) {
		const endpointNode: TreeNode = {
			id: `endpoint-${e.id}`,
			label: e.summary,
			kind: 'endpoint',
			method: e.method,
			rawId: e.id,
			folderId: e.folderId,
		};
		if (e.folderId !== null && folderNodes.has(e.folderId)) {
			folderNodes.get(e.folderId)!.children!.push(endpointNode);
		} else {
			root.push(endpointNode);
		}
	}

	return root;
}

export default function Workspace() {
	const { projectId } = useParams<{ projectId: string }>();

	const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
	const [endpoints, setEndpoints] = useState<ApiEndpoint[]>(MOCK_ENDPOINTS);
	const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);

	const items = useMemo(() => buildTree(folders, endpoints), [folders, endpoints]);
	const selectedEndpoint = useMemo(() => endpoints.find(e => e.id === selectedEndpointId) ?? null, [endpoints, selectedEndpointId]);

	return (
		<Layout>
			<PageUtilProvider
				folderControls={{ folders, setFolders }}
				endpointControls={{ endpoints, setEndpoints }}
				selectedControls={{ selectedEndpointId, setSelectedEndpointId }}
			>
				<Title>工作台</Title>
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						height: 'calc(100vh - 128px)',
						border: 1,
						borderColor: 'divider',
						borderRadius: 1,
						overflow: 'hidden',
						mx: 2,
					}}
				>
					<Box
						sx={{
							width: { xs: '100%', md: 300 },
							flexShrink: 0,
							borderRight: theme => ({
								xs: 0,
								md: '1px solid ' + theme.palette.divider,
							}),
							borderBottom: theme => ({
								xs: '1px solid ' + theme.palette.divider,
								md: 0,
							}),
							borderColor: 'divider',
						}}
					>
						<FolderTree
							projectId={Number(projectId ?? 1)}
							projectName={MOCK_PROJECT_NAME}
							items={items}
						/>
					</Box>
					<MainContent endpoint={selectedEndpoint} />
				</Box>
			</PageUtilProvider>
		</Layout>
	);
}
