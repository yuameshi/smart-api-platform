import { createContext, useCallback, useEffect, useState } from 'react';
import type { FC, PropsWithChildren } from 'react';
import type { AiSessionSummary } from 'shared';
import { createAiSession, deleteAiSession, listAiSessions } from '@/services/aiSessions';

type SessionContextValue = {
	sessions: AiSessionSummary[];
	activeId: string | null;
	loading: boolean;
	refresh: () => Promise<void>;
	createAndOpen: () => Promise<void>;
	select: (id: string) => void;
	remove: (id: string) => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SessionContext = createContext<SessionContextValue>({
	sessions: [],
	activeId: null,
	loading: true,
	refresh: async () => {},
	createAndOpen: async () => {},
	select: () => {},
	remove: async () => {},
});

type Props = PropsWithChildren<{ projectId: number }>;

export const SessionProvider: FC<Props> = ({ projectId, children }) => {
	const [sessions, setSessions] = useState<AiSessionSummary[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const refresh = useCallback(async () => {
		const list = await listAiSessions(projectId);
		setSessions(list);
	}, [projectId]);

	const createAndOpen = useCallback(async () => {
		const created = await createAiSession(projectId);
		await refresh();
		setActiveId(created.id);
	}, [projectId, refresh]);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			setLoading(true);
			try {
				let list = await listAiSessions(projectId);
				// 当前项目没有会话时自动新建并选中
				if (list.length === 0) {
					await createAiSession(projectId);
					list = await listAiSessions(projectId);
				}
				if (cancelled) return;
				setSessions(list);
				setActiveId(list[0]?.id ?? null);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		void load();

		return () => {
			cancelled = true;
		};
	}, [projectId]);

	const select = useCallback((id: string) => {
		setActiveId(id);
	}, []);

	const remove = useCallback(
		async (id: string) => {
			await deleteAiSession(id);
			const list = await listAiSessions(projectId);
			setSessions(list);
			// 如果删的正好是当前会话则切到剩下的第一个
			setActiveId(prev => (prev === id ? (list[0]?.id ?? null) : prev));
		},
		[projectId],
	);

	return (
		<SessionContext.Provider
			value={{
				sessions,
				activeId,
				loading,
				refresh,
				createAndOpen,
				select,
				remove,
			}}
		>
			{children}
		</SessionContext.Provider>
	);
};
