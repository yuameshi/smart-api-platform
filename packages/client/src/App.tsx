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
const Projects = lazy(() => import('./pages/Projects'));
const Workspace = lazy(() => import('./pages/Workspace'));

function App() {
	return (
		<Suspense fallback={<PageLoading />}>
			<Routes>
				<Route element={<RequireAuth />}>
					<Route
						path='/'
						element={<Home />}
					/>
					<Route
						path='/projects'
						element={<Projects />}
					/>
					<Route
						path='/projects/:projectId'
						element={<Workspace />}
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
