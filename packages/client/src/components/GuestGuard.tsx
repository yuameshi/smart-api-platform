import { useAtomValue } from 'jotai';
import { Navigate, Outlet } from 'react-router';

import { tokenAtom } from '@/atoms/token';

// 如果用户已登录，则重定向到首页
export default function GuestGuard() {
	const token = useAtomValue(tokenAtom);

	if (token) {
		return (
			<Navigate
				to='/'
				replace
			/>
		);
	}

	return <Outlet />;
}
