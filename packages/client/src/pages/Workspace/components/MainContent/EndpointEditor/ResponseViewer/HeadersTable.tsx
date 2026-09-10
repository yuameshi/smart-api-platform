import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

export const HeadersTable = ({ headers }: { headers: { key: string; value: string }[] }) => {
	if (headers.length === 0) {
		return (
			<Typography
				sx={{
					height: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				无响应头
			</Typography>
		);
	}

	return (
		<Table size='small'>
			<TableHead>
				<TableRow>
					<TableCell sx={{ width: '35%' }}>键</TableCell>
					<TableCell>值</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{headers.map((h, i) => (
					<TableRow key={i}>
						<TableCell>{h.key}</TableCell>
						<TableCell>{h.value}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
