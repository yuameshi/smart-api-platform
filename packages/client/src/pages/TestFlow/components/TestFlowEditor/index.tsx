import { useContext, useEffect, useState } from 'react';
import type { FC } from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { createTestStep, deleteTestStep, listTestSteps, updateTestStep } from '@/services/testSteps';
import { PageContext } from '../PageContext';
import type { AssertOperator, HttpMethod, TestFlow, TestStep, TestStepConfig, TestStepType } from 'shared';
import { HTTP_METHODS, ASSERT_OPERATORS } from 'shared';

type Props = {
	flow: TestFlow;
};

export const TestFlowEditor: FC<Props> = ({ flow }) => {
	const { setSnackbar } = useContext(PageContext);
	const [steps, setSteps] = useState<TestStep[]>([]);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [type, setType] = useState<TestStepType>('request');
	const [name, setName] = useState('');
	const [method, setMethod] = useState<HttpMethod>('GET');
	const [path, setPath] = useState('');
	const [operator, setOperator] = useState<AssertOperator>('eq');
	const [expected, setExpected] = useState('');

	const [reloadToken, setReloadToken] = useState(0);

	useEffect(() => {
		let active = true;
		listTestSteps(flow.id)
			.then(list => {
				if (active) setSteps(list);
			})
			.catch(() => {
				if (active) setSteps([]);
			});
		return () => {
			active = false;
		};
	}, [flow.id, reloadToken]);

	const reload = () => setReloadToken(token => token + 1);

	const resetForm = () => {
		setEditingId(null);
		setType('request');
		setName('');
		setMethod('GET');
		setPath('');
		setOperator('eq');
		setExpected('');
	};

	const submit = async () => {
		if (!name.trim()) {
			setSnackbar('请输入步骤名称');
			return;
		}
		const config: TestStepConfig = type === 'request' ? { method, path } : { operator, expected };
		if (editingId !== null) {
			await updateTestStep(flow.id, editingId, { type, name, config });
			setSnackbar('修改成功');
		} else {
			await createTestStep(flow.id, { type, name, config });
			setSnackbar('创建成功');
		}
		resetForm();
		reload();
	};

	const reqEdit = (step: TestStep) => {
		setEditingId(step.id);
		setType(step.type);
		setName(step.name);
		if ('path' in step.config) {
			setMethod(step.config.method);
			setPath(step.config.path);
		} else {
			setOperator(step.config.operator);
			setExpected(step.config.expected);
		}
	};

	const remove = async (step: TestStep) => {
		await deleteTestStep(flow.id, step.id);
		if (editingId === step.id) resetForm();
		setSnackbar('已删除');
		reload();
	};

	return (
		<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box>
				<Typography variant='h6'>{flow.name}</Typography>
				<Typography>{flow.description || '暂无描述'}</Typography>
			</Box>

			<Typography variant='subtitle1'>测试步骤</Typography>

			<Box
				component='form'
				sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
				onSubmit={event => {
					event.preventDefault();
					submit();
				}}
			>
				<TextField
					select
					size='small'
					label='类型'
					value={type}
					onChange={event => setType(event.target.value as TestStepType)}
				>
					<MenuItem value='request'>请求</MenuItem>
					<MenuItem value='assert'>断言</MenuItem>
				</TextField>
				<TextField
					size='small'
					label='名称'
					value={name}
					onChange={event => setName(event.target.value)}
				/>
				{type === 'request' ? (
					<>
						<TextField
							select
							size='small'
							label='方法'
							value={method}
							onChange={event => setMethod(event.target.value as HttpMethod)}
						>
							{HTTP_METHODS.map(item => (
								<MenuItem
									key={item}
									value={item}
								>
									{item}
								</MenuItem>
							))}
						</TextField>
						<TextField
							size='small'
							label='路径'
							value={path}
							onChange={event => setPath(event.target.value)}
						/>
					</>
				) : (
					<>
						<TextField
							select
							size='small'
							label='操作符'
							value={operator}
							onChange={event => setOperator(event.target.value as AssertOperator)}
						>
							{ASSERT_OPERATORS.map(item => (
								<MenuItem
									key={item}
									value={item}
								>
									{item}
								</MenuItem>
							))}
						</TextField>
						<TextField
							size='small'
							label='期望值'
							value={expected}
							onChange={event => setExpected(event.target.value)}
						/>
					</>
				)}
				<Button type='submit'>{editingId !== null ? '保存' : '新增'}</Button>
				{editingId !== null && <Button onClick={resetForm}>取消</Button>}
			</Box>

			{steps.length === 0 ? (
				<Typography>暂无步骤</Typography>
			) : (
				steps.map((step, index) => (
					<Box
						key={step.id}
						sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<Typography>
							{index + 1}. {step.type} {step.name} {JSON.stringify(step.config)}
						</Typography>
						<Button
							size='small'
							onClick={() => reqEdit(step)}
						>
							编辑
						</Button>
						<Button
							size='small'
							color='error'
							onClick={() => remove(step)}
						>
							删除
						</Button>
					</Box>
				))
			)}
		</Box>
	);
};

export default TestFlowEditor;
