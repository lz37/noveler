/* cspell:disable-next-line */
/** @type {import('@ianvs/prettier-plugin-sort-imports').PrettierConfig | import('prettier-plugin-jsdoc').AllOptions} */
const jsCommon = {
	singleQuote: true,
	quoteProps: 'as-needed',
	jsxSingleQuote: true,
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	proseWrap: 'preserve',
	embeddedLanguageFormatting: 'auto',
	/* cspell:disable-next-line */
	plugins: ['prettier-plugin-css-order', 'prettier-plugin-jsdoc', '@ianvs/prettier-plugin-sort-imports'],
	importOrder: ['<THIRD_PARTY_MODULES>', '', '^@frontend/(.*)$', '', '^[./]'],
	importOrderParserPlugins: [
		'typescript',
		'jsx',
		'classProperties',
		'dynamicImport',
		'["importAttributes", { "deprecatedAssertSyntax": true }]',
	],
	importOrderTypeScriptVersion: '5.6.3',
	jsdocSeparateReturnsFromParam: true,
	jsdocSeparateTagGroups: true,
	jsdocPreferCodeFences: true,
}

/** @type {import('prettier').Config} */
const config = {
	printWidth: 120,
	tabWidth: 2,
	useTabs: true,
	semi: false,
	singleQuote: true,
	requirePragma: false,
	insertPragma: false,
	proseWrap: 'preserve',
	htmlWhitespaceSensitivity: 'strict',
	endOfLine: 'auto',
	overrides: [
		{
			files: ['mdx'],
			options: { ...jsCommon },
		},
		{
			files: ['*.js', '*.mjs', '*.cjs', '*.jsx'],
			options: jsCommon,
		},
		{
			files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
			options: jsCommon,
		},
		{
			files: ['*.css', '*.scss', '*.sass', '*.less'],
			options: {
				plugins: ['prettier-plugin-css-order'],
			},
		},
		{
			files: ['package.json'],
			options: {
				plugins: ['prettier-plugin-pkg'],
			},
		},
		{
			files: ['*.json'],
			excludeFiles: ['package.json'],
			/** @type {typeof import('prettier-plugin-sort-json').options | import('prettier').Options} */
			options: {
				plugins: ['prettier-plugin-sort-json'],
				jsonRecursiveSort: true,
			},
		},
	],
}

export default config
