import { useContext, type FC } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { TreeNode } from '../..';
import { PageUtilContext } from '.';

type Props = {
	open: boolean;
	node: TreeNode | null;
	onClose: () => void;
	onComplete?: () => void;
};

export const DeleteDialog: FC<Props> = ({ open, node, onClose, onComplete }) => {
	const {
		setSnackbar,
		folderControls: { setFolders, folders },
		endpointControls: { setEndpoints },
		selectedControls: { selectedEndpointId, setSelectedEndpointId },
	} = useContext(PageUtilContext);

	const handleDelete = () => {
		if (!node?.id) return;
		if (node.kind === 'folder') {
			// 递归删除文件夹和子项
			setSnackbar('已删除文件夹');
		} else if (node.kind === 'endpoint') {
			setSnackbar('已删除端点');
		}
		onComplete?.();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
		>
			<DialogTitle>确认删除</DialogTitle>
			<DialogContent>
				<DialogContentText>
					删除{node?.kind === 'folder' ? '文件夹' : '端点'} {node?.label}？删除后不可恢复。
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>取消</Button>
				<Button
					color='error'
					variant='contained'
					onClick={handleDelete}
				>
					删除
				</Button>
			</DialogActions>
		</Dialog>
	);
};
