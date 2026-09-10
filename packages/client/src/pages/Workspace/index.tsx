import { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router';
import type { ApiEndpoint, Folder, HttpMethod } from 'shared';
import { Layout } from '@/components/Layout';
import { listEndpoints } from '@/services/endpoints';
import { listFolders } from '@/services/folders';
import { getProject } from '@/services/projects';
import Title from '@/utils/Title';
import { FolderTree } from './components/FolderTree';
import { MainContent } from './components/MainContent';
import { PageUtilProvider } from './components/PageUtil';

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
	const projectIdNumber = Number(projectId ?? 1);

	const [folders, setFolders] = useState<Folder[]>([]);
	const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
	const [projectName, setProjectName] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);

	const items = useMemo(() => buildTree(folders, endpoints), [folders, endpoints]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const [project, folderList, endpointList] = await Promise.all([
					getProject(projectIdNumber),
					listFolders(projectIdNumber),
					listEndpoints(projectIdNumber),
				]);
				setProjectName(project.name);
				setFolders(folderList);
				setEndpoints(endpointList);
			} catch (err) {
				setError(err instanceof Error ? err.message : '加载数据失败');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [projectIdNumber]);

	if (loading || error) {
		return (
			<Layout>
				<Title>工作台</Title>
				<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
					{loading && <CircularProgress />}
					{error && <Typography color='error'>{error}</Typography>}
				</Box>
			</Layout>
		);
	}

	return (
		<Layout>
			<PageUtilProvider
				projectId={projectIdNumber}
				folderControls={{ folders, setFolders }}
				endpointControls={{ endpoints, setEndpoints }}
				selectedControls={{ selectedEndpointId, setSelectedEndpointId }}
			>
				<Title>{projectName ? `项目${projectName}的工作台` : '工作台'}</Title>
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
							projectId={projectIdNumber}
							projectName={projectName}
							items={items}
						/>
					</Box>
					<MainContent />
				</Box>
			</PageUtilProvider>
		</Layout>
	);
}
