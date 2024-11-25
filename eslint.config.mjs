import path from 'path'
import { fileURLToPath } from 'url'
import cspellPlugin from '@cspell/eslint-plugin'
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@eslint/js'
import EslintConfigPrettier from 'eslint-config-prettier'
import functional from 'eslint-plugin-functional'
import EslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const _compat = new FlatCompat({
	baseDirectory: __dirname,
})

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	EslintPluginPrettierRecommended,
	EslintConfigPrettier,
	{
		ignores: ['**/node_modules/**/*', '**/dist/**/*', '**/build/**/*'],
		plugins: { '@cspell': cspellPlugin },
		rules: { '@cspell/spellchecker': ['warn', {}] },
	},
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		ignores: ['**/src/**/*.js', '**/src/**/*.mjs', '**/src/**/*.cjs'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.js', '**/*.cjs'],
		ignores: ['**/src/**/*.js', '**/src/**/*.cjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
	{
		files: ['**/*.ts'],
		extends: [
			functional.configs.externalTypeScriptRecommended,
			functional.configs.recommended,
			functional.configs.stylistic,
		],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'functional/no-expression-statements': ['error', { ignoreVoid: true, ignoreSelfReturning: true }],
		},
	},
	{
		ignores: ['**/node_modules/**/*', '**/dist/**/*', '**/build/**/*'],
		languageOptions: {
			parserOptions: {
				projectService: {
					defaultProject: `${__dirname}/tsconfig.json`,
					allowDefaultProject: ['projects/*/webpack.config.cjs'],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
			'@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
			'@typescript-eslint/no-unnecessary-condition': [
				'error',
				{
					allowConstantLoopConditions: true,
				},
			],
			'@typescript-eslint/no-floating-promises': [
				'error',
				{
					checkThenables: true,
					ignoreVoid: true,
					ignoreIIFE: true,
				},
			],
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{
					allowAny: false,
					allowBoolean: true,
					allowArray: false,
					allowNever: false,
					allowNullish: false,
					allowNumber: true,
					allowRegExp: true,
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	},
)
