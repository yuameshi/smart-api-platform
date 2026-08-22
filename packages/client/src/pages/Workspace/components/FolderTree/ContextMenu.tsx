import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useContext, type FC } from 'react';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { PageUtilContext } from '../PageUtil';
import type { TreeNode } from '../..';

export type ContextMenuData = {
	mouseX: number;
	mouseY: number;
	node: TreeNode;
};

type Props = {
	contextMenu: ContextMenuData | null;
	onClose: () => void;
};

export const ContextMenu: FC<Props> = ({ contextMenu, onClose }) => {
	const { requestCreateOrEdit, requestDelete } = useContext(PageUtilContext);

	return (
		<Menu
			open={contextMenu !== null}
			onClose={onClose}
			anchorReference='anchorPosition'
			anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
		>
			{contextMenu && contextMenu.node.kind === 'folder' && (
				<MenuItem
					onClick={() => {
						requestCreateOrEdit('create', 'folder', contextMenu.node);
						onClose();
					}}
				>
					<ListItemIcon>
						<CreateNewFolderIcon fontSize='small' />
					</ListItemIcon>
					<ListItemText>新建文件夹</ListItemText>
				</MenuItem>
			)}
			{contextMenu && contextMenu.node.kind === 'folder' && (
				<MenuItem
					onClick={() => {
						requestCreateOrEdit('create', 'endpoint', contextMenu.node);
						onClose();
					}}
				>
					<ListItemIcon>
						<AddIcon fontSize='small' />
					</ListItemIcon>
					<ListItemText>新建API</ListItemText>
				</MenuItem>
			)}
			<MenuItem
				onClick={() => {
					if (contextMenu?.node)
						requestCreateOrEdit('edit', contextMenu.node.kind === 'folder' ? 'folder' : 'endpoint', contextMenu?.node);
					onClose();
				}}
			>
				<ListItemIcon>
					<EditIcon fontSize='small' />
				</ListItemIcon>
				<ListItemText>修改项目</ListItemText>
			</MenuItem>
			<MenuItem
				onClick={() => {
					if (contextMenu?.node) requestDelete(contextMenu?.node);
					onClose();
				}}
			>
				<ListItemIcon>
					<DeleteIcon fontSize='small' />
				</ListItemIcon>
				<ListItemText>删除项目</ListItemText>
			</MenuItem>
		</Menu>
	);
};
