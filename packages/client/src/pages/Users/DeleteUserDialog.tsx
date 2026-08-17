import { userAtom } from '@/atoms/user';
import { deleteUser } from '@/services/users';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useAtomValue } from 'jotai';
import { useState, type FC } from 'react';
import type { PublicUser } from 'shared';

type Props = {
	deleteTarget: PublicUser | null;
	setDeleteTarget: (str: PublicUser | null) => void;
	setSnackbar: (str: string) => void;
	onDeleteComplete: () => void;
};

export const DeleteUserDialog: FC<Props> = ({ deleteTarget, setDeleteTarget, setSnackbar, onDeleteComplete }) => {
	const [deleting, setDeleting] = useState(false);
	const user = useAtomValue(userAtom);

	const handleDelete = async () => {
		if (!deleteTarget) return;
		if (deleteTarget.id === user?.id) {
			setDeleteTarget(null);
			setSnackbar('请勿删除自身。')
			return;
		}
		setDeleting(true);
		try {
			await deleteUser(deleteTarget.id);
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
			<DialogTitle>删除用户</DialogTitle>
			<DialogContent>
				<DialogContentText>确定要删除 {deleteTarget?.username} 吗？此操作不可撤销。</DialogContentText>
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
