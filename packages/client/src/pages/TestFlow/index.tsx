import { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router';
import type { TestFlow } from 'shared';
import { Layout } from '@/components/Layout';
import Title from '@/utils/Title';
import { listTestFlows } from '@/services/testFlows';
import { PageContextProvider } from './components/PageContext';
import { TestFlowList } from './components/TestFlowList';
import { TestFlowEditor } from './components/TestFlowEditor';
import { Placeholder } from './components/Placeholder';

export default function TestFlowPage() {
	const { projectId } = useParams<{ projectId: string }>();
	const projectIdNumber = Number(projectId ?? 1);

	const [flows, setFlows] = useState<TestFlow[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const list = await listTestFlows(projectIdNumber);
				if (active) setFlows(list);
			} catch (err) {
				if (active) setError(err instanceof Error ? err.message : '获取测试流程列表失败');
			} finally {
				if (active) setLoading(false);
			}
		};
		fetchData();
		return () => {
			active = false;
		};
	}, [projectIdNumber]);

	const selectedFlow = useMemo(() => flows.find(f => f.id === selectedId) ?? null, [flows, selectedId]);

	if (loading || error) {
		return (
			<Layout>
				<Title>测试流程</Title>
				<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
					{loading && <CircularProgress />}
					{error && <Typography color='error'>{error}</Typography>}
				</Box>
			</Layout>
		);
	}

	return (
		<Layout>
			<Title>测试流程</Title>
			<PageContextProvider
				projectId={projectIdNumber}
				flowControls={{ flows, setFlows }}
				selectedControls={{ selectedId, setSelectedId }}
			>
				<Box sx={{ minHeight: '70vh', px: 3, py: 2 }}>
					<Box
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', md: 'row' },
							minHeight: 'calc(100vh - 200px)',
							border: 1,
							borderColor: 'divider',
							borderRadius: 1,
							overflow: 'hidden',
						}}
					>
						<Box
							sx={{
								width: { xs: '100%', md: 280 },
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
							<TestFlowList />
						</Box>
						<Box sx={{ flex: '1 1 auto', overflow: 'hidden', minWidth: 0 }}>
							{selectedFlow ? <TestFlowEditor flow={selectedFlow} /> : <Placeholder />}
						</Box>
					</Box>
				</Box>
			</PageContextProvider>
		</Layout>
	);
}
