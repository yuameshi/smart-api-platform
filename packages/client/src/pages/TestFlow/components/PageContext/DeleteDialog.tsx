import { useContext, useState, type FC } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { TestFlow } from 'shared';
import { deleteTestFlow } from '@/services/testFlows';
import { PageContext } from '.';

type Props = {
	open: boolean;
	flow: TestFlow | null;
	onClose: () => void;
};

export const DeleteDialog: FC<Props> = ({ open, flow, onClose }) => {
	const {
		flowControls: { setFlows },
		selectedControls: { selectedId, setSelectedId },
		setSnackbar,
	} = useContext(PageContext);
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!flow) return;
		setDeleting(true);
		try {
			await deleteTestFlow(flow.id);
			setFlows(prev => prev.filter(f => f.id !== flow.id));
			if (selectedId === flow.id) setSelectedId(null);
			setSnackbar('已删除');
			onClose();
		} catch (err) {
			setSnackbar(err instanceof Error ? err.message : '删除失败');
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
				<DialogContentText>确定要删除测试流程 {flow?.name} 吗？此操作不可撤销。</DialogContentText>
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
					onClick={() => void handleDelete()}
					disabled={deleting}
				>
					删除
				</Button>
			</DialogActions>
		</Dialog>
	);
};
