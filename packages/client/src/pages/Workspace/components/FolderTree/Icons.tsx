import { Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import type { HttpMethod } from 'shared';
import type { TreeNode } from '../..';

const METHOD_COLORS: Record<HttpMethod, { label: string; color: string }> = {
	GET: { label: 'GET', color: '#0a0' },
	POST: { label: 'POST', color: '#cc0' },
	PUT: { label: 'PUT', color: '#6cf' },
	PATCH: { label: 'PAT', color: '#a855f7' },
	DELETE: { label: 'DEL', color: '#f00' },
	HEAD: { label: 'HEAD', color: '#000' },
	OPTIONS: { label: 'OPT', color: '#000' },
};

// HTTP方法图标和文件夹图标
export function NodeIcon({ node }: { node: TreeNode }) {
	if (node.kind === 'endpoint') {
		return (
			<Typography
				component='span'
				variant='caption'
				sx={{
					width: 30, // POST长度
					fontSize: 11,
					fontWeight: 700,
					color: node.method ? METHOD_COLORS[node.method].color : 'text.secondary',
					textTransform: 'uppercase',
					flexShrink: 0,
				}}
			>
				{node.method ? METHOD_COLORS[node.method].label : 'UNK'}
			</Typography>
		);
	}

	return <FolderOpenIcon sx={{ fontSize: 18, flexShrink: 0 }} />;
}
