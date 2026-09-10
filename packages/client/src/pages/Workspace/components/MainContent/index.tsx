import type { FC } from 'react';
import { Box } from '@mui/material';
import { useContext, useMemo } from 'react';
import { PageUtilContext } from '../PageUtil';
import { Placeholder } from './Placeholder';
import { EndpointEditor } from './EndpointEditor';

export const MainContent: FC = () => {
	const { endpointControls, selectedControls } = useContext(PageUtilContext);
	const selectedEndpoint = useMemo(
		() => endpointControls.endpoints.find(e => e.id === selectedControls.selectedEndpointId) ?? null,
		[endpointControls.endpoints, selectedControls.selectedEndpointId],
	);

	return (
		<Box sx={{ flex: '1 1 auto', overflow: 'hidden', minWidth: 0 }}>
			{selectedEndpoint ? <EndpointEditor endpoint={selectedEndpoint} /> : <Placeholder />}
		</Box>
	);
};
