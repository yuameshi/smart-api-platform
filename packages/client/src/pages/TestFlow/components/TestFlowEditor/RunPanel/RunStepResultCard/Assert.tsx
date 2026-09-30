import { Alert } from '@mui/material';
import { FC } from 'react';
import { AssertionVerdict } from 'shared';

type Props = {
	assertion: AssertionVerdict;
};

export const Assert: FC<Props> = ({ assertion }) => (
	<Alert
		severity={assertion.pass ? 'success' : 'error'}
		sx={{ wordBreak: 'break-word' }}
	>
		左值：{assertion.leftValue ?? '（不存在）'} ｜ 操作符：{assertion.operator} ｜ 期望：
		{assertion.expected || '（无）'} ｜ {assertion.message}
	</Alert>
);
