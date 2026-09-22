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
	const projectIdNumber = Number(projectId ?? -1);

	const [flows, setFlows] = useState<TestFlow[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		const fetchData = async () => {
			if (!Number.isInteger(projectIdNumber) || projectIdNumber <= 0) {
				setError('项目ID无效');
				setLoading(false);
				return;
			}
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
						<TestFlowList />
					</Box>
					{selectedFlow ? <TestFlowEditor flow={selectedFlow} /> : <Placeholder />}
				</Box>
			</PageContextProvider>
		</Layout>
	);
}
