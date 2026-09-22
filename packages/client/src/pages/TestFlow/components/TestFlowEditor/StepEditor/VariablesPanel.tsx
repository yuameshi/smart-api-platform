import { useContext, type FC } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { StepManagerContext } from '../StepManagerContext';

// 展示提取的变量列表
export const VariablesPanel: FC = () => {
	const { steps } = useContext(StepManagerContext);

	const variablesArr: {
		var: string;
		operation: string;
	}[] = [];

	steps.forEach((step, index) => {
		if (step.type === 'request') {
			step.config.extractions.forEach(rule => {
				if (rule.enabled && rule.variableName.trim() !== '') {
					if (!variablesArr.some(v => v.var === rule.variableName)) {
						variablesArr.push({
							var: rule.variableName,
							operation: `请求步骤${index + 1}提取`,
						});
					} else {
						variablesArr.push({
							var: rule.variableName,
							operation: `请求步骤${index + 1}更新`,
						});
					}
				}
			});
			return;
		} else {
			const left = step.config.left;
			if (left.mode === 'variable' && left.value.trim() !== '') {
				variablesArr.push({
					var: left.value,
					operation: `断言步骤${index + 1}引用`,
				});
			}
		}
	});

	const rows = [...variablesArr.values()];

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
				p: 2,
				borderTop: '1px solid',
				borderColor: 'divider',
			}}
		>
			<Typography variant='h5'>变量</Typography>
			<Typography>通过请求步骤提取和断言步骤引用的变量会在这里列出。</Typography>
			<Table size='small'>
				<TableHead>
					<TableRow>
						<TableCell>变量名</TableCell>
						<TableCell>来源</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.length === 0 ? (
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
						rows.map((row, index) => (
							<TableRow key={index}>
								<TableCell>{row.var}</TableCell>
								<TableCell>{row.operation}</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</Box>
	);
};
