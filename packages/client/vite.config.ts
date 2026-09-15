import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
			shared: path.resolve(import.meta.dirname, '../shared/src/index.ts'),
		},
	},
	server: {
		port: 5173,
		// 开发环境代理配置：将 /api 请求转发到 NestJS 后端
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
		},
	},
	build: {
		// Monaco Editor按需加载
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: 'monaco-editor',
							test: /monaco-editor/,
						},
					],
				},
			},
		},
	},
});
