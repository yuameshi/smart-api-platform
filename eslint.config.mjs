import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
	{ ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/*.tsbuildinfo'] },
	{
		files: ['packages/server/**/*.ts', 'packages/shared/**/*.ts'],
		extends: [...tseslint.configs.recommended],
		languageOptions: { globals: globals.node },
	},
	{
		files: ['packages/client/**/*.{ts,tsx}'],
		extends: [...tseslint.configs.recommended, reactHooks.configs.flat['recommended-latest'], reactRefresh.configs.vite],
		languageOptions: { globals: globals.browser },
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			// 忽略解构赋值的闲置变量
			'@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
		},
	},
);
