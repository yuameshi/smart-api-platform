import type { FC } from 'react';
import { Box, MenuItem, TextField } from '@mui/material';
import { ASSERT_OPERATORS } from 'shared';
import type { AssertOperator } from 'shared';
import type { AssertStepConfig } from 'shared';
import type { DraftStep } from '../draft-steps';

type Props = {
	step: Extract<DraftStep, { type: 'assert' }>;
	onChange: (next: AssertStepConfig) => void;
};

// 中文标签
const OPERATOR_LABELS: Record<AssertOperator, string> = {
	eq: '等于',
	neq: '不等于',
	contains: '包含',
	notContains: '不包含',
	exists: '存在',
	notExists: '不存在',
	matches: '匹配正则',
	notMatches: '不匹配正则',
	gt: '大于',
	gte: '大于等于',
	lt: '小于',
	lte: '小于等于',
	isJson: '是JSON',
	isNumber: '是数字',
	isEmpty: '为空',
};

// 无需右值的操作符
const NO_EXPECTED_OPERATORS: readonly AssertOperator[] = ['exists', 'notExists', 'isJson', 'isNumber', 'isEmpty'];

type LeftModeList = AssertStepConfig['left']['mode'];

// 左值信息
const LEFT_INFO: Record<LeftModeList, AssertStepConfig['left'] & { tag: string }> = {
	variable: { mode: 'variable', tag: '变量', value: '' },
	jsonpath: { mode: 'jsonpath', tag: 'JSONPath', value: '' },
	literal: { mode: 'literal', tag: '常量', value: '' },
};

export const AssertStepForm: FC<Props> = ({ step, onChange }) => {
	const config = step.config;
	const left = config.left;

	return (
		<Box
			sx={{
				display: 'flex',
				gap: 1,
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flex: 1,
					minWidth: '50%',
					gap: 1,
				}}
			>
				<TextField
					select
					size='small'
					label='左值'
					value={left.mode}
					onChange={event =>
						onChange({
							...config,
							left: {
								// 去掉tag属性
								mode: LEFT_INFO[event.target.value as LeftModeList].mode,
								value: LEFT_INFO[event.target.value as LeftModeList].value,
							},
						})
					}
				>
					<MenuItem value='variable'>{LEFT_INFO.variable.tag}</MenuItem>
					<MenuItem value='jsonpath'>{LEFT_INFO.jsonpath.tag}</MenuItem>
					<MenuItem value='literal'>{LEFT_INFO.literal.tag}</MenuItem>
				</TextField>
				<TextField
					sx={{ flex: 1 }}
					size='small'
					label={LEFT_INFO[left.mode].tag}
					value={left.value}
					onChange={event => onChange({ ...config, left: { mode: left.mode, value: event.target.value } })}
				/>
			</Box>
			<Box
				sx={{
					display: 'flex',
					gap: 1,
					...(!NO_EXPECTED_OPERATORS.includes(config.operator) && {
						flex: 1,
						minWidth: '50%',
					}),
				}}
			>
				<TextField
					select
					size='small'
					label='操作符'
					value={config.operator}
					onChange={event => onChange({ ...config, operator: event.target.value as AssertOperator })}
				>
					{ASSERT_OPERATORS.map(item => (
						<MenuItem
							key={item}
							value={item}
						>
							{OPERATOR_LABELS[item]}
						</MenuItem>
					))}
				</TextField>
				{!NO_EXPECTED_OPERATORS.includes(config.operator) && (
					<TextField
						sx={{ flex: 1 }}
						size='small'
						label='期望值'
						value={config.expected}
						onChange={event => onChange({ ...config, expected: event.target.value })}
					/>
				)}
			</Box>
		</Box>
	);
};
