import { Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

type Row = {
	key: string;
	value: string;
	active: boolean;
	description?: string;
};

type Props<T extends Row> = {
	rows: T[];
	onChange: (rows: T[]) => void;
	keyPlaceholder?: string;
};

const isEmptyRow = (r: Row) => r.key === '' && r.value === '' && (r.description ?? '') === '';

export const KeyValueTable = <T extends Row>({ rows, onChange, keyPlaceholder = '键' }: Props<T>) => {
	// 在末尾追加一个空行，用于新增行
	const rowsWithEmptyRow =
		rows.length > 0 && isEmptyRow(rows[rows.length - 1]) ? rows : ([...rows, { key: '', value: '', active: true }] as T[]);

	const update = (index: number, patch: Partial<T>) => {
		if (index >= rows.length) {
			// 空行编辑后转为正常行
			if (patch.key === undefined && patch.value === undefined && patch.description === undefined) return;
			onChange([...rows, { ...rowsWithEmptyRow[index], ...patch } as T]);
			return;
		}
		onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
	};

	const remove = (index: number) => {
		if (index >= rows.length) return; // 额外空行不可删除
		onChange(rows.filter((_, i) => i !== index));
	};

	return (
		<Table size='small'>
			<TableHead>
				<TableRow>
					<TableCell padding='checkbox' />
					<TableCell>{keyPlaceholder}</TableCell>
					<TableCell>值</TableCell>
					<TableCell>描述</TableCell>
					<TableCell padding='checkbox' />
				</TableRow>
			</TableHead>
			<TableBody>
				{rowsWithEmptyRow.map((row, i) => (
					<TableRow
						key={i}
						sx={{ backgroundColor: row.active ? undefined : 'action.disabledBackground' }}
					>
						<TableCell padding='checkbox'>
							<Checkbox
								size='small'
								checked={row.active}
								disabled={i >= rows.length}
								onChange={e => update(i, { active: e.target.checked } as Partial<T>)}
							/>
						</TableCell>
						<TableCell>
							<TextField
								size='small'
								fullWidth
								value={row.key}
								placeholder='键'
								onChange={e => update(i, { key: e.target.value } as Partial<T>)}
							/>
						</TableCell>
						<TableCell>
							<TextField
								size='small'
								fullWidth
								value={row.value}
								placeholder='值'
								onChange={e => update(i, { value: e.target.value } as Partial<T>)}
							/>
						</TableCell>
						<TableCell>
							<TextField
								size='small'
								fullWidth
								value={row.description ?? ''}
								onChange={e => update(i, { description: e.target.value } as Partial<T>)}
							/>
						</TableCell>
						<TableCell padding='checkbox'>
							<IconButton
								size='small'
								onClick={() => remove(i)}
								disabled={i >= rows.length}
							>
								<DeleteIcon fontSize='small' />
							</IconButton>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
