import { createContext, useMemo, useState } from 'react';
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react';

type PanelView = 'edit' | 'run';

// eslint-disable-next-line react-refresh/only-export-components
export const UiContext = createContext<{
	panelView: PanelView;
	setPanelView: Dispatch<SetStateAction<PanelView>>;
	loading: boolean;
	setLoading: Dispatch<SetStateAction<boolean>>;
	loadError: string | null;
	setLoadError: Dispatch<SetStateAction<string | null>>;
}>({
	panelView: 'edit',
	setPanelView: () => {},
	loading: false,
	setLoading: () => {},
	loadError: null,
	setLoadError: () => {},
});

type Props = {
	testFlowId: number;
};

export const UiProvider: FC<PropsWithChildren<Props>> = ({ testFlowId, children }) => {
	const [panelView, setPanelView] = useState<PanelView>('edit');
	const [loading, setLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [prevTestFlowId, setPrevTestFlowId] = useState(testFlowId);

	// 切换流程重置视图
	if (prevTestFlowId !== testFlowId) {
		setPrevTestFlowId(testFlowId);
		setPanelView('edit');
	}

	const contextValue = useMemo(
		() => ({
			panelView,
			setPanelView,
			loading,
			setLoading,
			loadError,
			setLoadError,
		}),
		[panelView, loading, loadError],
	);

	return <UiContext.Provider value={contextValue}>{children}</UiContext.Provider>;
};
