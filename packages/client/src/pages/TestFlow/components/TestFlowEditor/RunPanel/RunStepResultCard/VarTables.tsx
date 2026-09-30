import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { FC } from 'react';

type Props = {
	extractions: {
		variableName: string;
		value: string;
	}[];
};

export const VarTables: FC<Props> = ({ extractions }) => {
	return (
		<Box sx={{ minWidth: 0, overflowX: 'auto' }}>
			<Typography
				variant='body2'
				sx={{ fontWeight: 'bold' }}
			>
				提取到的变量
			</Typography>
			<Table size='small'>
				<TableHead>
					<TableRow>
						<TableCell>变量名</TableCell>
						<TableCell width='85%'>值</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{extractions.map(item => (
						<TableRow key={item.variableName}>
							<TableCell>{item.variableName}</TableCell>
							<TableCell sx={{ wordBreak: 'break-all' }}>{item.value}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Box>
	);
};
