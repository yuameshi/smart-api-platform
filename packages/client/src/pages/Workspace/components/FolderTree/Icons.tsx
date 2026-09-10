import { Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import type { TreeNode } from '../..';
import { METHOD_INFO } from '../../constants/method-colors';

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
					color: node.method ? METHOD_INFO[node.method].color : 'text.secondary',
					textTransform: 'uppercase',
					flexShrink: 0,
				}}
			>
				{node.method ? METHOD_INFO[node.method].label : 'UNK'}
			</Typography>
		);
	}

	return <FolderOpenIcon sx={{ fontSize: 18, flexShrink: 0 }} />;
}
