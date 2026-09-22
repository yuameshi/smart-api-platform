import { Box } from '@mui/material';
import { KeyValueTable } from '@/components/KeyValueTable';
import type { EndpointDraft } from '../draft';

type Props = {
	draft: EndpointDraft;
	setDraft: (update: (prev: EndpointDraft) => EndpointDraft) => void;
};

export const HeadersTab = ({ draft, setDraft }: Props) => {
	return (
		<Box sx={{ p: 1, overflow: 'auto' }}>
			<KeyValueTable
				rows={draft.headers}
				onChange={rows => setDraft(prev => ({ ...prev, headers: rows }))}
			/>
		</Box>
	);
};
