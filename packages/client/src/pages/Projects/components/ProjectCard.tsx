import { Card, CardContent, Typography, Box, IconButton, CardActionArea } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { FC } from 'react';
import type { Project } from 'shared';

type Props = {
	project: Project;
	onEdit: (project: Project) => void;
	onDelete: (project: Project) => void;
};

export const ProjectCard: FC<Props> = ({ project, onEdit, onDelete }) => {
	return (
		<Card>
			<CardActionArea onClick={() => project}>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '1 1 auto' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography
							variant='h6'
							sx={{ fontSize: '1rem' }}
						>
							<Typography
								sx={{
									fontSize: '0.95rem',
									color: 'text.secondary',
									mr: 0.25,
								}}
								component='span'
							>
								#{project.id}
							</Typography>
							{project.name}
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<IconButton
								size='small'
								aria-label='编辑项目'
								onClick={e => {
									e.stopPropagation();
									onEdit(project);
								}}
							>
								<EditIcon fontSize='small' />
							</IconButton>
							<IconButton
								size='small'
								aria-label='删除项目'
								onClick={e => {
									e.stopPropagation();
									onDelete(project);
								}}
							>
								<DeleteIcon fontSize='small' />
							</IconButton>
						</Box>
					</Box>
					<Box sx={{ color: 'text.secondary' }}>
						<Typography
							variant='body2'
							component='pre'
						>
							{project.description ?? '--'}
						</Typography>
					</Box>
				</CardContent>
			</CardActionArea>
		</Card>
	);
};
