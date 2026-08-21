import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Snackbar, Typography } from '@mui/material';
import type { Project } from 'shared';
import { Layout } from '@/components/Layout';
import Title from '@/utils/Title';
import { listProjects } from '@/services/projects';
import { ProjectFormDialog } from './components/ProjectFormDialog';
import { DeleteProjectDialog } from './components/DeleteProjectDialog';
import { ProjectCard } from './components/ProjectCard';
import { Skeleton } from './components/Skeleton';
import { Empty } from './components/Empty';
import { PageToolbox } from './components/PageToolbox';

export default function Projects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [snackbar, setSnackbar] = useState('');

	const [search, setSearch] = useState('');

	const [formOpen, setFormOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<Project | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

	const loadProjects = useCallback(() => {
		listProjects()
			.then(data => {
				setProjects(data);
				setLoadError(null);
			})
			.catch(err => {
				setLoadError(err instanceof Error ? err.message : '获取项目列表失败');
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		loadProjects();
	}, [loadProjects]);

	const handleOpenProjectForm = (project: Project | null) => {
		setEditingProject(project);
		setFormOpen(true);
	};

	const filteredProjects = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return projects;
		return projects.filter(p => p.name.toLowerCase().includes(q));
	}, [projects, search]);

	return (
		<Layout>
			<Title>项目管理</Title>
			<Box sx={{ minHeight: '70vh', px: 3, py: 2 }}>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						gap: 2,
						flexDirection: { xs: 'column', md: 'row' },
						justifyContent: 'space-between',
						alignItems: { xs: 'flex-start', md: 'center' },
						mb: 2,
					}}
				>
					<Typography
						variant='h5'
						component='h1'
					>
						项目管理
					</Typography>
					<PageToolbox
						search={search}
						setSearch={setSearch}
						loadProjects={loadProjects}
						handleOpenProjectForm={handleOpenProjectForm}
					/>
				</Box>
				{loadError && (
					<Alert
						severity='error'
						sx={{ mb: 2 }}
					>
						{loadError}
					</Alert>
				)}
				{loading ? (
					<Skeleton />
				) : filteredProjects.length === 0 ? (
					<Empty />
				) : (
					<Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
						{filteredProjects.map(p => (
							<ProjectCard
								key={p.id}
								project={p}
								onEdit={handleOpenProjectForm}
								onDelete={setDeleteTarget}
							/>
						))}
					</Box>
				)}
				<ProjectFormDialog
					open={formOpen}
					project={editingProject}
					onClose={() => setFormOpen(false)}
					onSaved={loadProjects}
					setSnackbar={setSnackbar}
				/>
				<DeleteProjectDialog
					setSnackbar={setSnackbar}
					deleteTarget={deleteTarget}
					setDeleteTarget={setDeleteTarget}
					onDeleteComplete={loadProjects}
				/>
				<Snackbar
					open={snackbar !== ''}
					autoHideDuration={2000}
					message={snackbar}
					onClose={() => setSnackbar('')}
					anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				/>
			</Box>
		</Layout>
	);
}
