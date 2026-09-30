import { FC } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import type { VariableStore } from 'shared';

type Props = {
	vars: VariableStore;
};

export const RunVariablesPanel: FC<Props> = ({ vars }) => {
	return (
		<Box sx={{ overflowX: 'auto' }}>
			<Typography
				sx={{ p: 1 }}
				variant='h6'
			>
				运行变量
			</Typography>
			<Table
				size='small'
				sx={{ tableLayout: 'fixed' }}
			>
				<TableHead>
					<TableRow>
						<TableCell sx={{ width: '30%' }}>变量名</TableCell>
						<TableCell sx={{ width: '40%' }}>当前值</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{Object.keys(vars).length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={2}
								align='center'
								sx={{ p: 2 }}
							>
								暂无变量
							</TableCell>
						</TableRow>
					) : (
						Object.keys(vars).map(row => (
							<TableRow key={row}>
								<TableCell>
									<Tooltip title={row}>
										<Typography
											variant='body2'
											noWrap
										>
											{row}
										</Typography>
									</Tooltip>
								</TableCell>
								<TableCell>
									<Tooltip title={vars[row]}>
										<Typography
											variant='body2'
											noWrap
										>
											{vars[row]}
										</Typography>
									</Tooltip>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</Box>
	);
};
