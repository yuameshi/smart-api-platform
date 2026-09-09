import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { Project } from 'shared';
import { createProject, updateProject } from '@/services/projects';

interface ProjectFormData {
	name: string;
	description: string;
	baseUrl: string;
}

interface Props {
	open: boolean;
	project: Project | null;
	onClose: () => void;
	onSaved: () => void;
	setSnackbar: (str: string) => void;
}

export const ProjectFormDialog: FC<Props> = ({ open, project, onClose, onSaved, setSnackbar }) => {
	const isEdit = project !== null;
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ProjectFormData>({
		defaultValues: {
			name: project?.name ?? '',
			description: project?.description ?? '',
			baseUrl: project?.baseUrl ?? '',
		},
	});

	useEffect(() => {
		if (open) {
			reset({
				name: project?.name ?? '',
				description: project?.description ?? '',
				baseUrl: project?.baseUrl ?? '',
			});
		}
	}, [open, project, reset]);

	const handleRequestClose = () => {
		setErrorMsg(null);
		onClose();
	};

	const onSubmit = async (data: ProjectFormData) => {
		setLoading(true);
		setErrorMsg(null);

		try {
			const trimmedBaseUrl = data.baseUrl.trim();
			const basePayload = {
				name: data.name,
				description: data.description.trim() ? data.description : undefined,
			};
			if (isEdit) {
				await updateProject(project.id, { ...basePayload, baseUrl: trimmedBaseUrl ? trimmedBaseUrl : null });
			} else {
				await createProject({ ...basePayload, baseUrl: trimmedBaseUrl ? trimmedBaseUrl : undefined });
			}
			setSnackbar(isEdit ? '修改成功' : '创建成功');
			onSaved();
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
			<DialogTitle>{isEdit ? '编辑项目' : '新建项目'}</DialogTitle>
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
					id='project-form'
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<TextField
						{...register('name', {
							required: '请输入项目名称',
							maxLength: { value: 100, message: '项目名称超长' },
						})}
						label='项目名称'
						fullWidth
						margin='normal'
						error={!!errors.name}
						helperText={errors.name?.message}
						disabled={loading}
					/>
					<TextField
						{...register('description')}
						label='项目描述'
						fullWidth
						margin='normal'
						multiline
						rows={3}
						error={!!errors.description}
						helperText={errors.description?.message}
						disabled={loading}
					/>
					<TextField
						{...register('baseUrl')}
						label='Base URL'
						placeholder='http://localhost:3000/'
						fullWidth
						margin='normal'
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
					form='project-form'
					variant='contained'
					disabled={loading}
				>
					保存
				</Button>
			</DialogActions>
		</Dialog>
	);
};
