import { useContext, useState, type FC } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { deleteFolder } from '@/services/folders';
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
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!node?.id) return;
		setDeleting(true);
		try {
			if (node.kind === 'folder') {
				// 调用API批量递归删除文件夹
				await deleteFolder(node.rawId!);
				// 本地递归删除文件夹
				const idsToRemove = new Set<number>([node.rawId!]);
				let changed = true;
				while (changed) {
					changed = false;
					for (const f of folders) {
						if (f.parentId !== null && idsToRemove.has(f.parentId) && !idsToRemove.has(f.id)) {
							idsToRemove.add(f.id);
							changed = true;
						}
					}
				}
				setFolders(prev => prev.filter(f => !idsToRemove.has(f.id)));
				setEndpoints(prev => prev.filter(e => !(e.folderId !== null && idsToRemove.has(e.folderId))));
				setSnackbar('已删除文件夹');
			} else if (node.kind === 'endpoint') {
				setEndpoints(prev => prev.filter(e => e.id !== node.rawId));
				if (selectedEndpointId === node.rawId) setSelectedEndpointId(null);
				setSnackbar('已删除端点');
			}
			onComplete?.();
		} catch (error) {
			setSnackbar(error instanceof Error ? error.message : '删除失败');
		} finally {
			setDeleting(false);
		}
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
				<Button
					onClick={onClose}
					disabled={deleting}
				>
					取消
				</Button>
				<Button
					color='error'
					variant='contained'
					onClick={handleDelete}
					disabled={deleting}
				>
					删除
				</Button>
			</DialogActions>
		</Dialog>
	);
};
