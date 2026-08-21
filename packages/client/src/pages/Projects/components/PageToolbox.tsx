import { Box, TextField, InputAdornment, IconButton, Button } from '@mui/material';
import { Project } from 'shared';
import type { FC } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

type Props = {
	search: string;
	setSearch: (s: string) => void;
	loadProjects: () => void;
	handleOpenProjectForm: (project: Project | null) => void;
};

export const PageToolbox: FC<Props> = ({ search, setSearch, loadProjects, handleOpenProjectForm }) => {
	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				gap: 2,
				flex: 1,
				justifyContent: 'flex-end',
			}}
		>
			<TextField
				label='筛选项目名称'
				value={search}
				size='small'
				onChange={e => setSearch(e.target.value)}
				sx={{ flex: '1 1 auto', minWidth: 200, maxWidth: { md: 400 } }}
				slotProps={{
					input: {
						endAdornment: search && (
							<InputAdornment position='end'>
								<IconButton
									size='small'
									onClick={() => setSearch('')}
								>
									<DeleteIcon />
								</IconButton>
							</InputAdornment>
						),
					},
				}}
			/>
			<Button
				startIcon={<RefreshIcon />}
				onClick={loadProjects}
			>
				刷新
			</Button>
			<Button
				variant='contained'
				startIcon={<AddIcon />}
				onClick={() => handleOpenProjectForm(null)}
			>
				新建项目
			</Button>
		</Box>
	);
};
