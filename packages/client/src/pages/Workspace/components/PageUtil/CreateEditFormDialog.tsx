import { useContext, useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { createFolder, updateFolder } from '@/services/folders';
import { createEndpoint, editEndpointMeta } from '@/services/endpoints';
import type { TreeNode } from '../..';
import { PageUtilContext } from '.';

interface CreateEditFormData {
	name: string;
	path: string;
	parentId: number | 'null';
}

type Props = {
	open: boolean;
	mode: 'create' | 'edit';
	type: 'endpoint' | 'folder';
	activeNode: TreeNode | null;
	onClose: () => void;
	onComplete: () => void;
};

// 包含创建/修改 + 端点/文件夹功能
export const CreateEditFormDialog: FC<Props> = ({ open, mode, type, activeNode, onClose, onComplete }) => {
	const {
		projectId,
		folderControls: { folders, setFolders },
		endpointControls: { endpoints, setEndpoints },
		setSnackbar,
	} = useContext(PageUtilContext);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// 默认父文件夹选项
	const defaultParentId = useMemo<number | 'null'>(() => {
		if (mode === 'create') {
			return activeNode?.kind === 'folder' ? (activeNode.rawId ?? 'null') : (activeNode?.folderId ?? 'null');
		}
		return activeNode?.kind === 'folder' ? (activeNode.parentId ?? 'null') : (activeNode?.folderId ?? 'null');
	}, [mode, activeNode]);

	// 如果是编辑端点就获取端点当前路径
	const defaultPath = useMemo(() => {
		if (type !== 'endpoint' || mode !== 'edit' || !activeNode?.rawId) return '';
		return endpoints.find(e => e.id === activeNode.rawId)?.path ?? '';
	}, [type, mode, activeNode, endpoints]);

	const defaultValues = useMemo(
		() => ({
			name: mode === 'create' ? '' : (activeNode?.label ?? ''),
			path: defaultPath,
			parentId: defaultParentId,
		}),
		[activeNode, defaultPath, defaultParentId, mode],
	);

	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateEditFormData>({ defaultValues });

	useEffect(() => {
		if (open) {
			reset(defaultValues);
		}
	}, [open, defaultValues, reset]);

	const handleClose = () => {
		setErrorMsg(null);
		onClose();
	};

	const handleSubmitForm = async (data: CreateEditFormData) => {
		try {
			const parentId = data.parentId === 'null' ? null : Number(data.parentId);

			if (type === 'folder') {
				if (mode === 'create') {
					// 创建文件夹
					const newFolder = await createFolder({
						projectId,
						parentId: parentId ?? undefined,
						name: data.name,
					});
					setFolders(prev => [...prev, newFolder]);
					setSnackbar('文件夹创建成功');
				} else if (mode === 'edit' && activeNode?.rawId) {
					// 编辑文件夹
					await updateFolder(activeNode.rawId, {
						name: data.name,
						parentId,
					});
					setFolders(prev =>
						prev.map(f =>
							f.id === activeNode.rawId ? { ...f, name: data.name, parentId, updatedAt: new Date().toISOString() } : f,
						),
					);
					setSnackbar('文件夹更新成功');
				}
			} else if (type === 'endpoint') {
				if (mode === 'create') {
					// 创建端点
					const newEndpoint = await createEndpoint({
						projectId,
						folderId: parentId,
						path: data.path,
						summary: data.name,
					});
					setEndpoints(prev => [...prev, newEndpoint]);
					setSnackbar('API端点创建成功');
				} else if (mode === 'edit' && activeNode?.rawId) {
					// 编辑端点元信息
					await editEndpointMeta(activeNode.rawId, {
						path: data.path,
						summary: data.name,
						folderId: parentId,
					});
					setEndpoints(prev =>
						prev.map(e =>
							e.id === activeNode.rawId
								? { ...e, path: data.path, summary: data.name, folderId: parentId, updatedAt: new Date().toISOString() }
								: e,
						),
					);
					setSnackbar('API端点更新成功');
				}
			}

			onComplete();
		} catch (error) {
			setErrorMsg(error instanceof Error ? error.message : '操作失败，请重试');
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth='sm'
			fullWidth
		>
			<DialogTitle>
				{mode === 'create' ? '新建' : '修改'}
				{type === 'folder' ? '文件夹' : 'API端点'}
			</DialogTitle>
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
					id='folder-form'
					onSubmit={handleSubmit(handleSubmitForm)}
					noValidate
				>
					<TextField
						{...register('name', {
							required: '请输入名称',
							maxLength: { value: type === 'endpoint' ? 200 : 100, message: '名称超长' },
						})}
						label='名称'
						fullWidth
						margin='normal'
						autoFocus
						error={!!errors.name}
						helperText={errors.name?.message}
					/>
					{type === 'endpoint' && (
						<TextField
							{...register('path', {
								required: '请输入API路径',
								maxLength: { value: 255, message: '路径超长' },
							})}
							label='API路径'
							placeholder='/api/v1/goods'
							fullWidth
							margin='normal'
							error={!!errors.path}
							helperText={errors.path?.message}
						/>
					)}
					<Controller
						name='parentId'
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								select
								label={type === 'folder' ? '上级文件夹' : '所属文件夹'}
								fullWidth
								margin='normal'
							>
								<MenuItem value='null'>项目根目录</MenuItem>
								{folders.map(folder => (
									<MenuItem
										key={folder.id}
										value={folder.id}
									>
										{folder.name}
									</MenuItem>
								))}
							</TextField>
						)}
					/>
				</form>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={handleClose}>取消</Button>
				<Button
					type='submit'
					form='folder-form'
					variant='contained'
				>
					保存
				</Button>
			</DialogActions>
		</Dialog>
	);
};
