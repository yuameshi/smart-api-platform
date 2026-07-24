import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';

/**
 * 统一的请求客户端
 * 基于 axios 封装，自动附加 Bearer token 并解包统一响应格式
 *
 * 后端所有响应均包装为 { code, data, message } 格式，
 * 响应拦截器自动提取 data 字段，调用方只需处理业务数据。
 * 错误响应中 data 为 null，错误信息在 message 中。
 */
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// 自动附加 JWT 认证令牌
api.interceptors.request.use(
	config => {
		const raw = localStorage.getItem('token');
		if (raw) {
			try {
				const token = JSON.parse(raw) as string;
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
			} catch {
				// token 存储格式异常，跳过
			}
		}
		return config;
	},
	error => Promise.reject(error),
);

// 解包后端返回值
api.interceptors.response.use(
	response => {
		const body = response.data as Record<string, unknown>;
		// 如果响应体符合统一格式 { code, data, message }，则提取 data
		if (body && typeof body.code === 'number' && 'data' in body) {
			return body.data;
		}
		// 否则原样返回
		return response.data;
	},
	error => {
		if (axios.isAxiosError(error) && error.response) {
			const body = error.response.data as Record<string, unknown>;
			const message = (body?.message as string) || error.message || '请求失败';
			return Promise.reject(new Error(message));
		}
		return Promise.reject(error);
	},
);

export default api;
