import { useAtomValue } from 'jotai';
import { Navigate, Outlet } from 'react-router';

import { tokenAtom } from '@/atoms/token';

// 如果用户未登录，则重定向到登录页
export default function RequireAuth() {
	const token = useAtomValue(tokenAtom);

	if (!token) {
		return (
			<Navigate
				to='/login'
				replace
			/>
		);
	}

	return <Outlet />;
}
