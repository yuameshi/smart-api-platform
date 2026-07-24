import { Routes, Route, Navigate } from 'react-router';
import Login from './pages/Login';
import Home from './pages/Home';

// 应用根组件，配置前端路由
function App() {
	return (
		<Routes>
			{/* 首页路由 */}
			<Route
				path='/'
				element={<Home />}
			/>
			{/* 登录页路由 */}
			<Route
				path='/login'
				element={<Login />}
			/>
			{/* 未匹配路由默认跳转到登录页 */}
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
	);
}

export default App;
