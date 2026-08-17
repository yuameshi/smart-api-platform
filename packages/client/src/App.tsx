import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import PageLoading from '@/utils/PageLoading';
import RequireAuth from '@/components/RequireAuth';
import GuestGuard from '@/components/GuestGuard';
import AdminGuard from '@/components/AdminGuard';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Users = lazy(() => import('./pages/Users'));

function App() {
	return (
		<Suspense fallback={<PageLoading />}>
			<Routes>
				<Route element={<RequireAuth />}>
					<Route
						path='/'
						element={<Home />}
					/>
					<Route element={<AdminGuard />}>
						<Route
							path='/users'
							element={<Users />}
						/>
					</Route>
				</Route>
				<Route element={<GuestGuard />}>
					<Route
						path='/login'
						element={<Login />}
					/>
					<Route
						path='/register'
						element={<Register />}
					/>
				</Route>
				<Route
					path='*'
					element={
						<Navigate
							to='/login'
							replace
						/>
					}
				/>
			</Routes>
		</Suspense>
	);
}

export default App;
