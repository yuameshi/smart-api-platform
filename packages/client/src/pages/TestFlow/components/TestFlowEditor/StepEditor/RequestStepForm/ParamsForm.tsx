import { Box, Typography } from '@mui/material';
import type { KeyValueEntry } from 'shared';
import { useEffect, useMemo, useRef } from 'react';
import { KeyValueTable } from '@/pages/Workspace/components/MainContent/EndpointEditor/KeyValueTable';
import { getPathParams } from '@/pages/Workspace/components/MainContent/EndpointEditor/draft';

type Props = {
	path: string;
	params: KeyValueEntry[];
	headers: KeyValueEntry[];
	pathParams: KeyValueEntry[];
	onPathParamsChange: (params: KeyValueEntry[]) => void;
	onParamsChange: (params: KeyValueEntry[]) => void;
	onHeadersChange: (headers: KeyValueEntry[]) => void;
};

export const ParamsForm = ({ path, params, headers, pathParams, onPathParamsChange, onParamsChange, onHeadersChange }: Props) => {
	// 从URL提取路径参数
	const pathParamKeys = useMemo(() => getPathParams(path), [path]);
	// 使用ref保存上次pathParams，避免放到useEffect的dep array中导致无限循环
	const pathParamsRef = useRef(pathParams);
	// 渲染时更新ref
	useEffect(() => {
		pathParamsRef.current = pathParams;
	});
	useEffect(() => {
		const current = pathParamsRef.current;
		// 判断是否确实有修改
		const sameKeys =
			current.length === pathParamKeys.length &&
			pathParamKeys.every((key, i) => {
				return current[i]?.key === key;
			});

		if (sameKeys) return;

		// 如果路径参数发生变化，更新pathParams
		const newPathParams = pathParamKeys.map(key => {
			const existing = current.find(p => p.key === key);
			return (
				existing ?? {
					key,
					value: '',
					description: '',
					active: true,
				}
			);
		});

		onPathParamsChange(newPathParams);
	}, [pathParamKeys, onPathParamsChange]);

	return (
		<>
			<Box>
				<Typography variant='h5'>路径参数</Typography>
				<KeyValueTable
					rows={pathParams}
					keyPlaceholder='参数名'
					onChange={onPathParamsChange}
				/>
			</Box>
			<Box>
				<Typography variant='h5'>查询参数</Typography>
				<KeyValueTable
					rows={params}
					keyPlaceholder='参数名'
					onChange={onParamsChange}
				/>
			</Box>
			<Box>
				<Typography variant='h5'>请求头</Typography>
				<KeyValueTable
					rows={headers}
					keyPlaceholder='请求头'
					onChange={onHeadersChange}
				/>
			</Box>
		</>
	);
};
