import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useContext } from 'react';
import { PageUtilContext } from '../../PageUtil';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

export const AddFolderCard = () => {
	const { requestCreateOrEdit } = useContext(PageUtilContext);

	return (
		<Card sx={{ height: 250, width: 200 }}>
			<CardActionArea
				onClick={() => requestCreateOrEdit('create', 'folder', null)}
				sx={{
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<CardContent
					sx={{
						flexDirection: 'column',
						display: 'flex',
						gap: 2,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<CreateNewFolderIcon sx={{ fontSize: 48 }} />
					<Typography sx={{ fontSize: 24 }}>新建文件夹</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	);
};
