import { Dialog, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { listEndpoints } from '@/services/endpoints';
import { ApiEndpoint } from 'shared';

type Props = {
	projectId: number;
	open: boolean;
	handleClose: () => void;
	handleSelectEndpoint: (endpoint: ApiEndpoint) => void;
};

export const ImportApiDialog: FC<Props> = ({ projectId, open, handleClose, handleSelectEndpoint }) => {
	const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);

	useEffect(() => {
		const fetchEndpoints = async () => {
			setEndpoints(await listEndpoints(projectId));
		};
		fetchEndpoints();
	}, [projectId]);

	return (
		<Dialog
			onClose={handleClose}
			open={open}
		>
			<DialogTitle>选择导入端点</DialogTitle>
			<DialogContent>
				<DialogContentText>将清空并使用端点中数据替换现有内容</DialogContentText>
			</DialogContent>
			<List sx={{ minWidth: 400, mb: 2 }}>
				{endpoints.map(endpoint => (
					<ListItem
						key={endpoint.id}
						disablePadding
						sx={{ px: 1.5 }}
					>
						<ListItemButton onClick={() => handleSelectEndpoint(endpoint)}>
							<ListItemText
								primary={endpoint.summary}
								secondary={
									<>
										{endpoint.method} {endpoint.path}
										<br />
										{endpoint.description}
									</>
								}
							/>
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Dialog>
	);
};
