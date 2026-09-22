import { Box, MenuItem, Select, TextField } from '@mui/material';
import { HTTP_METHODS } from 'shared';
import type { HttpMethod } from 'shared';
import { METHOD_INFO } from '@/pages/Workspace/constants/method-colors';
import type { DraftStep } from '../../draft-steps';
import type { RequestStepConfig } from 'shared';
import { AuthForm } from './AuthForm';
import { BodyForm } from './BodyForm';
import { ExtractVariablesForm } from './ExtractVariablesForm';
import { ParamsForm } from './ParamsForm';
import type { FC } from 'react';

type Props = {
	step: Extract<DraftStep, { type: 'request' }>;
	onChange: (next: RequestStepConfig) => void;
};

export const RequestStepForm: FC<Props> = ({ step, onChange }) => {
	const config = step.config;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
				<Select
					value={config.method}
					onChange={event => onChange({ ...config, method: event.target.value as HttpMethod })}
					renderValue={method => (
						<span
							style={{
								color: METHOD_INFO[method].color,
								fontWeight: 'bold',
							}}
						>
							{method}
						</span>
					)}
					size='small'
					sx={{ minWidth: 120 }}
				>
					{HTTP_METHODS.map(method => (
						<MenuItem
							key={method}
							value={method}
							sx={{ color: METHOD_INFO[method].color, fontWeight: 'bold' }}
						>
							{method}
						</MenuItem>
					))}
				</Select>
				<TextField
					size='small'
					fullWidth
					value={config.path}
					onChange={event => onChange({ ...config, path: event.target.value })}
					placeholder='/api/users/'
				/>
			</Box>

			<ParamsForm
				params={config.params}
				headers={config.headers}
				path={config.path}
				pathParams={config.pathParams}
				onPathParamsChange={pathParams => onChange({ ...config, pathParams })}
				onParamsChange={params => onChange({ ...config, params })}
				onHeadersChange={headers => onChange({ ...config, headers })}
			/>
			<AuthForm
				auth={config.auth}
				onChange={auth => onChange({ ...config, auth })}
			/>
			<BodyForm
				body={config.body}
				onChange={body => onChange({ ...config, body })}
			/>
			<ExtractVariablesForm
				rules={config.extractions}
				onChange={extractions => onChange({ ...config, extractions })}
			/>
		</Box>
	);
};
