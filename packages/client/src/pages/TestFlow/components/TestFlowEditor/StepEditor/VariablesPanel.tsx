import { useContext, type FC } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { StepContext } from '../Contexts/StepContext';
import { RequestStepConfig } from 'shared';

// packages\server\src\modules\test-flow\runner\step-executor.ts
function collectTemplates(config: RequestStepConfig): string[] {
	const templates: string[] = [config.path];
	for (const entry of [...config.pathParams, ...config.params, ...config.headers]) {
		templates.push(entry.value);
	}
	if (config.body.kind === 'raw') templates.push(config.body.raw);
	if (config.body.kind === 'formUrlEncoded') {
		for (const entry of config.body.entries) templates.push(entry.value);
	}
	if (config.auth.kind === 'bearer') templates.push(config.auth.token);
	if (config.auth.kind === 'basic') templates.push(config.auth.username, config.auth.password);
	for (const rule of config.extractions) templates.push(rule.jsonPath);
	return templates;
}

// 展示提取的变量列表
export const VariablesPanel: FC = () => {
	const { steps } = useContext(StepContext);

	const variablesArr: {
		var: string;
		operation: string;
	}[] = [];

	steps.forEach((step, index) => {
		if (step.type === 'request') {
			collectTemplates(step.config).forEach(template => {
				template.match(/\{\{\s*([^{}]+?)\s*\}\}/g)?.forEach(match => {
					const varName = match.replace(/\{\{\s*([^{}]+?)\s*\}\}/, '$1');
					if (varName.trim() !== '') {
						variablesArr.push({
							var: varName,
							operation: `请求步骤${index + 1}引用`,
						});
					}
				});
			});
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
					operation: `断言步骤${index + 1}的左值引用`,
				});
			}
			step.config.expected.match(/\{\{\s*([^{}]+?)\s*\}\}/g)?.forEach(match => {
				const varName = match.replace(/\{\{\s*([^{}]+?)\s*\}\}/, '$1');
				if (varName.trim() !== '') {
					variablesArr.push({
						var: varName,
						operation: `断言步骤${index + 1}的期望值引用`,
					});
				}
			});
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
