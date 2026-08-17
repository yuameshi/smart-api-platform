import { useAtomValue } from 'jotai';
import { Navigate, Outlet } from 'react-router';
import { userAtom } from '@/atoms/user';

// 未登录或非管理员访问时重定向到首页
export default function AdminGuard() {
	const user = useAtomValue(userAtom);

	if (!user || user.isAdmin !== true) {
		return (
			<Navigate
				to='/'
				replace
			/>
		);
	}

	return <Outlet />;
}
