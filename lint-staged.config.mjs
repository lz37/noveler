// @ts-check
import fs from 'fs/promises'
import path from 'path'
import isBinaryPath from 'is-binary-path'
import micromatch from 'micromatch'
import { isEmpty } from 'ramda'
import shebangCommand from 'shebang-command'

/** @param {string[]} filenames */
const buildEslintCommand = (filenames) =>
	`eslint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

/** @param {string[]} filenames */
const changeEolCommand = (filenames) =>
	`crlf --set=LF ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

/** @param {string[]} filenames */
const prettierCommand = (filenames) =>
	`prettier --write ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

/** @param {string[]} filenames */
const shfmtCommand = (filenames) => `shfmt --write ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

/** @param {string[]} filenames */
const cspellLintCommand = (filenames) =>
	`cspell lint ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

/**
 * @param {string[]} filenames
 * @param {(filenames: string[]) => string} command
 */
const checkEmptyCommand = (filenames, command) => (isEmpty(filenames) ? [] : [command(filenames)])

/** @param {string} filename */
const isShellScript = async (filename) => {
	if (filename.endsWith('.sh') || filename.endsWith('.zsh') || filename.endsWith('.bash')) return true
	// get first line of file
	const sheBang = (await fs.readFile(filename, { encoding: 'utf-8' })).split('\n')[0]
	const command = shebangCommand(sheBang)
	return command?.endsWith('sh') || false
}

/** @type {import('lint-staged').Config} */
const lintStage = async (allStagedFiles) => {
	const noBinaryFile = allStagedFiles.filter((f) => !isBinaryPath(f))
	const srcJsFiles = micromatch(noBinaryFile, [
		'**/src/**/*.js',
		'**/src/**/*.mjs',
		'**/src/**/*.cjs',
		'**/src/**/*.jsx',
	])
	if (srcJsFiles.length) {
		throw new Error(`JavaScript files aren't allowed in src directory`)
	}
	const jsAndTsFiles = micromatch(noBinaryFile, [
		'**/*.js',
		'**/*.mjs',
		'**/*.cjs',
		'**/*.ts',
		'**/*.mts',
		'**/*.cts',
		'**/*.tsx',
		'**/*.jsx',
	])
	const jsonFile = noBinaryFile.filter((f) => f.endsWith('.json') || f.endsWith('.json5'))
	const yamlFile = noBinaryFile
		.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
		.filter((f) => !f.includes('pnpm-lock'))
	const /** @type {string[]} */ shellFiles = []
	for (const f of noBinaryFile) {
		if ((await isShellScript(f)) && !f.endsWith('.p10k.zsh')) {
			shellFiles.push(f)
		}
	}
	const ignoreFiles = noBinaryFile.filter((f) => f.endsWith('ignore'))
	const dockerFiles = noBinaryFile.filter((f) => f.endsWith('Dockerfile'))

	return checkEmptyCommand(noBinaryFile, changeEolCommand)
		.concat(checkEmptyCommand(noBinaryFile, cspellLintCommand))
		.concat(checkEmptyCommand(jsAndTsFiles, buildEslintCommand))
		.concat(checkEmptyCommand([...jsonFile, ...yamlFile], prettierCommand))
		.concat(checkEmptyCommand([...shellFiles, ...ignoreFiles, ...dockerFiles], shfmtCommand))
}

export default lintStage
