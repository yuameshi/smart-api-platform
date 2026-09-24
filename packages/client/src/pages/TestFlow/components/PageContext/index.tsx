import { Snackbar } from '@mui/material';
import { createContext, useCallback, useMemo, useState } from 'react';
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react';
import type { TestFlow } from 'shared';
import { DeleteDialog } from './DeleteDialog';
import { TestFlowFormDialog } from './TestFlowFormDialog';

// eslint-disable-next-line react-refresh/only-export-components
export const PageContext = createContext<{
	projectId: number;
	flowControls: {
		flows: TestFlow[];
		setFlows: Dispatch<SetStateAction<TestFlow[]>>;
	};
	selectedControls: {
		selectedFlow: TestFlow | null;
		selectedId: number | null;
		setSelectedId: Dispatch<SetStateAction<number | null>>;
	};
	requestCreateOrEdit: (mode: 'create' | 'edit', flow: TestFlow | null) => void;
	requestDelete: (flow: TestFlow) => void;
	setSnackbar: (message: string) => void;
}>({
	projectId: -1,
	flowControls: { flows: [], setFlows: () => {} },
	selectedControls: {
		selectedFlow: null,
		selectedId: null,
		setSelectedId: () => {},
	},
	requestCreateOrEdit: () => {},
	requestDelete: () => {},
	setSnackbar: () => {},
});

type Props = {
	projectId: number;
	flowControls: {
		flows: TestFlow[];
		setFlows: Dispatch<SetStateAction<TestFlow[]>>;
	};
	selectedControls: {
		selectedId: number | null;
		setSelectedId: Dispatch<SetStateAction<number | null>>;
	};
};

export const PageContextProvider: FC<PropsWithChildren<Props>> = ({
	projectId,
	flowControls: { flows, setFlows },
	selectedControls: { selectedId, setSelectedId },
	children,
}) => {
	const [snackbar, setSnackbar] = useState('');
	const [deleteTarget, setDeleteTarget] = useState<null | TestFlow>(null);
	const [createEditForm, setCreateEditForm] = useState<{
		mode: 'create' | 'edit';
		flow: TestFlow | null;
	} | null>(null);

	const requestDelete = useCallback(async (flow: TestFlow) => {
		setDeleteTarget(flow);
	}, []);

	const requestCreateOrEdit = useCallback(async (mode: 'create' | 'edit', flow: TestFlow | null) => {
		setCreateEditForm({ mode, flow });
	}, []);

	const contextValue = useMemo(
		() => ({
			projectId,
			flowControls: { flows, setFlows },
			selectedControls: {
				selectedFlow: flows.find(f => f.id === selectedId) ?? null,
				selectedId,
				setSelectedId,
			},
			requestCreateOrEdit,
			requestDelete,
			setSnackbar,
		}),
		[projectId, flows, setFlows, selectedId, setSelectedId, requestCreateOrEdit, requestDelete],
	);

	return (
		<PageContext.Provider value={contextValue}>
			{children}
			<TestFlowFormDialog
				open={createEditForm !== null}
				mode={createEditForm?.mode ?? 'create'}
				flow={createEditForm?.flow ?? null}
				onClose={() => setCreateEditForm(null)}
			/>
			<DeleteDialog
				open={deleteTarget !== null}
				flow={deleteTarget}
				onClose={() => setDeleteTarget(null)}
			/>
			<Snackbar
				open={snackbar !== ''}
				autoHideDuration={2000}
				message={snackbar}
				onClose={() => setSnackbar('')}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			/>
		</PageContext.Provider>
	);
};
