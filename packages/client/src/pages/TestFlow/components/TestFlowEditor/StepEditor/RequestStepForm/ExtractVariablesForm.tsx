import { Box, Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ExtractionRule } from 'shared';

type Props = {
	rules: ExtractionRule[];
	onChange: (rules: ExtractionRule[]) => void;
};

const isEmptyRow = (r: ExtractionRule) => r.variableName === '' && r.jsonPath === '' && (r.defaultValue ?? '') === '';

export const ExtractVariablesForm = ({ rules, onChange }: Props) => {
	// 在末尾追加一个空行，用于新增规则
	const rowsWithEmptyRow =
		rules.length > 0 && isEmptyRow(rules[rules.length - 1])
			? rules
			: [
					...rules,
					{
						variableName: '',
						jsonPath: '',
						enabled: true,
						defaultValue: '',
					},
				];

	const update = (index: number, patch: Partial<ExtractionRule>) => {
		if (index >= rules.length) {
			// 空行编辑后转为正常规则
			if (!(patch.variableName !== undefined || patch.jsonPath !== undefined || patch.defaultValue !== undefined)) return;
			onChange([
				...rules,
				{
					variableName: '',
					jsonPath: '',
					enabled: true,
					defaultValue: '',
					...patch,
				},
			]);
			return;
		}
		onChange(rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
	};

	const remove = (index: number) => {
		if (index >= rules.length) return; // 额外空行不可删除
		onChange(rules.filter((_, i) => i !== index));
	};

	return (
		<Box>
			<Typography variant='h5'>提取变量</Typography>
			<Typography>提取出的变量后续可以使用 {'{{变量名}}'} 引用，留空代表取整个响应体</Typography>
			<Table size='small'>
				<TableHead>
					<TableRow>
						<TableCell></TableCell>
						<TableCell>变量名</TableCell>
						<TableCell>JSONPath</TableCell>
						<TableCell>默认值</TableCell>
						<TableCell padding='checkbox' />
					</TableRow>
				</TableHead>
				<TableBody>
					{rowsWithEmptyRow.map((rule, i) => (
						<TableRow key={i}>
							<TableCell padding='checkbox'>
								<Checkbox
									size='small'
									checked={rule.enabled}
									disabled={i >= rules.length}
									onChange={e => update(i, { enabled: e.target.checked })}
								/>
							</TableCell>
							<TableCell>
								<TextField
									size='small'
									fullWidth
									value={rule.variableName}
									placeholder='变量名'
									onChange={e => update(i, { variableName: e.target.value })}
								/>
							</TableCell>
							<TableCell>
								<TextField
									size='small'
									fullWidth
									value={rule.jsonPath}
									placeholder='$.data.token'
									onChange={e => update(i, { jsonPath: e.target.value })}
								/>
							</TableCell>
							<TableCell>
								<TextField
									size='small'
									fullWidth
									value={rule.defaultValue ?? ''}
									placeholder='默认值'
									onChange={e => update(i, { defaultValue: e.target.value })}
								/>
							</TableCell>
							<TableCell padding='checkbox'>
								<IconButton
									size='small'
									onClick={() => remove(i)}
									disabled={i >= rules.length}
								>
									<DeleteIcon fontSize='small' />
								</IconButton>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Box>
	);
};
