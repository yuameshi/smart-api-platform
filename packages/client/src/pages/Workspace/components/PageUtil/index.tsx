import { Snackbar } from '@mui/material';
import { createContext, useState } from 'react';
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react';
import { DeleteDialog } from './DeleteDialog';
import { CreateEditFormDialog } from './CreateEditFormDialog';
import type { ApiEndpoint, Folder } from 'shared';
import type { TreeNode } from '../..';

// eslint-disable-next-line react-refresh/only-export-components
export const PageUtilContext = createContext<{
	folderControls: {
		folders: Folder[];
		setFolders: Dispatch<SetStateAction<Folder[]>>;
	};
	endpointControls: {
		endpoints: ApiEndpoint[];
		setEndpoints: Dispatch<SetStateAction<ApiEndpoint[]>>;
	};
	selectedControls: {
		selectedEndpointId: number | null;
		setSelectedEndpointId: Dispatch<SetStateAction<number | null>>;
	};
	requestCreateOrEdit: (mode: 'create' | 'edit', type: 'endpoint' | 'folder', node: TreeNode | null) => void;
	requestDelete: (node: TreeNode) => void;
	setSnackbar: (message: string) => void;
}>({
	folderControls: { folders: [], setFolders: () => {} },
	endpointControls: { endpoints: [], setEndpoints: () => {} },
	selectedControls: { selectedEndpointId: null, setSelectedEndpointId: () => {} },
	requestCreateOrEdit: () => {},
	requestDelete: () => {},
	setSnackbar: () => {},
});

type Props = {
	folderControls: {
		folders: Folder[];
		setFolders: Dispatch<SetStateAction<Folder[]>>;
	};
	endpointControls: {
		endpoints: ApiEndpoint[];
		setEndpoints: Dispatch<SetStateAction<ApiEndpoint[]>>;
	};
	selectedControls: {
		selectedEndpointId: number | null;
		setSelectedEndpointId: Dispatch<SetStateAction<number | null>>;
	};
};

export const PageUtilProvider: FC<PropsWithChildren<Props>> = ({
	folderControls: { folders, setFolders },
	endpointControls: { endpoints, setEndpoints },
	selectedControls: { selectedEndpointId, setSelectedEndpointId },
	children,
}) => {
	const [snackbar, setSnackbar] = useState('');
	const [deleteTarget, setDeleteTarget] = useState<null | TreeNode>(null);
	const [createEditForm, setCreateEditForm] = useState<{
		mode: 'create' | 'edit';
		type: 'endpoint' | 'folder';
		node: TreeNode | null;
	} | null>(null);

	const requestDelete = async (node: TreeNode) => {
		setDeleteTarget(node);
	};

	const requestCreateOrEdit = async (mode: 'create' | 'edit', type: 'endpoint' | 'folder', node: TreeNode | null) => {
		setCreateEditForm({ mode, type, node });
	};

	return (
		<PageUtilContext.Provider
			value={{
				folderControls: { folders, setFolders },
				endpointControls: { endpoints, setEndpoints },
				selectedControls: { selectedEndpointId, setSelectedEndpointId },
				requestCreateOrEdit,
				requestDelete,
				setSnackbar,
			}}
		>
			{children}
			<CreateEditFormDialog
				open={createEditForm !== null}
				mode={createEditForm?.mode ?? 'create'}
				type={createEditForm?.type ?? 'folder'}
				activeNode={createEditForm?.node ?? null}
				onClose={() => setCreateEditForm(null)}
				onComplete={() => setCreateEditForm(null)}
			/>
			<DeleteDialog
				open={deleteTarget !== null}
				node={deleteTarget}
				onClose={() => setDeleteTarget(null)}
				onComplete={() => setDeleteTarget(null)}
			/>
			<Snackbar
				open={snackbar !== ''}
				autoHideDuration={2000}
				message={snackbar}
				onClose={() => setSnackbar('')}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			/>
		</PageUtilContext.Provider>
	);
};
