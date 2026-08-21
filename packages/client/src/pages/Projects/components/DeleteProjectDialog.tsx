import { deleteProject } from '@/services/projects';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useState, type FC } from 'react';
import type { Project } from 'shared';

type Props = {
	deleteTarget: Project | null;
	setDeleteTarget: (project: Project | null) => void;
	setSnackbar: (str: string) => void;
	onDeleteComplete: () => void;
};

export const DeleteProjectDialog: FC<Props> = ({ deleteTarget, setDeleteTarget, setSnackbar, onDeleteComplete }) => {
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await deleteProject(deleteTarget.id);
			setSnackbar('删除成功');
			setDeleteTarget(null);
			onDeleteComplete();
		} catch (err) {
			setSnackbar(err instanceof Error ? err.message : '删除失败');
		} finally {
			setDeleting(false);
		}
	};

	return (
		<Dialog
			open={!!deleteTarget}
			onClose={() => setDeleteTarget(null)}
		>
			<DialogTitle>删除项目</DialogTitle>
			<DialogContent>
				<DialogContentText>
					确定要删除项目 {deleteTarget?.name} 吗？此操作不可撤销。
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => setDeleteTarget(null)}
					disabled={deleting}
				>
					取消
				</Button>
				<Button
					color='error'
					onClick={handleDelete}
					disabled={deleting}
				>
					删除
				</Button>
			</DialogActions>
		</Dialog>
	);
};
