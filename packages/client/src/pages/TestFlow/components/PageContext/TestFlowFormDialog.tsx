import { useContext, useEffect, useState } from 'react';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { TestFlow } from 'shared';
import { createTestFlow, updateTestFlow } from '@/services/testFlows';
import { PageContext } from '.';

interface TestFlowFormData {
	name: string;
	description: string;
}

type Props = {
	open: boolean;
	mode: 'create' | 'edit';
	flow: TestFlow | null;
	onClose: () => void;
};

export const TestFlowFormDialog: FC<Props> = ({ open, mode, flow, onClose }) => {
	const {
		projectId,
		flowControls: { setFlows },
		setSnackbar,
	} = useContext(PageContext);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TestFlowFormData>({
		defaultValues: {
			name: flow?.name ?? '',
			description: flow?.description ?? '',
		},
	});

	useEffect(() => {
		if (open) {
			reset({
				name: flow?.name ?? '',
				description: flow?.description ?? '',
			});
		}
	}, [open, flow, reset]);

	const handleRequestClose = () => {
		setErrorMsg(null);
		onClose();
	};

	const onSubmit = async (data: TestFlowFormData) => {
		setLoading(true);
		setErrorMsg(null);

		try {
			const description = data.description.trim();
			if (mode === 'edit' && flow) {
				await updateTestFlow(flow.id, { name: data.name, description: description || null });
				setFlows(prev =>
					prev.map(flows =>
						flows.id === flow.id
							? {
									...flows,
									name: data.name,
									description: description || null,
									updatedAt: new Date().toISOString(),
								}
							: flows,
					),
				);
				setSnackbar('修改成功');
			} else {
				const created = await createTestFlow({ projectId, name: data.name, description: description || undefined });
				setFlows(prev => [...prev, created]);
				setSnackbar('创建成功');
			}
			onClose();
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : '操作失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleRequestClose}
			maxWidth='sm'
			fullWidth
		>
			<DialogTitle>{mode === 'edit' ? '编辑测试流程' : '新建测试流程'}</DialogTitle>
			<DialogContent>
				{errorMsg && (
					<Alert
						severity='error'
						sx={{ mb: 2 }}
						onClose={() => setErrorMsg(null)}
					>
						{errorMsg}
					</Alert>
				)}
				<form
					id='test-flow-form'
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<TextField
						{...register('name', {
							required: '请输入流程名称',
							maxLength: { value: 100, message: '流程名称超长' },
						})}
						label='流程名称'
						fullWidth
						margin='normal'
						error={!!errors.name}
						helperText={errors.name?.message}
						disabled={loading}
					/>
					<TextField
						{...register('description')}
						label='流程描述'
						fullWidth
						margin='normal'
						multiline
						rows={3}
						error={!!errors.description}
						helperText={errors.description?.message}
						disabled={loading}
					/>
				</form>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button
					onClick={handleRequestClose}
					disabled={loading}
				>
					取消
				</Button>
				<Button
					type='submit'
					form='test-flow-form'
					variant='contained'
					disabled={loading}
				>
					保存
				</Button>
			</DialogActions>
		</Dialog>
	);
};
