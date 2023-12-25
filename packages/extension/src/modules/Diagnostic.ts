import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import { getAbsolutePaths } from 'common/utils'
import { DiagnosticSeverityKeys, Commands } from 'common/types'
import { initing } from '@/extension'

const targetFiles = ['plaintext', 'markdown']

const collection = vscode.languages.createDiagnosticCollection('noveler')

export const onChangeEditor = vscode.window.onDidChangeActiveTextEditor(
  async (editor) => {
    if (!editor) return
    await updateDiagnostics(editor.document)
  },
)

export const onChangeDocument = vscode.workspace.onDidChangeTextDocument(
  async (event) => {
    await updateDiagnostics(event.document)
  },
)

export const onChangConf = vscode.workspace.onDidChangeConfiguration(
  async (event) => {
    if (initing) return
    if (event.affectsConfiguration('noveler')) {
      await vscode.commands.executeCommand(Commands.ReloadTXT)
    }
  },
)

export const onChangeConfDocument = vscode.workspace.onDidChangeTextDocument(
  async (event) => {
    const confFiles = await getConfFiles()
    if (confFiles?.includes(event.document.fileName)) {
      await vscode.commands.executeCommand(Commands.ReloadTXT)
    }
  },
)

const getConfFiles = async () => {
  const confFilesOrDirs = confHandler
    .get()
    .confTXTFiles?.map((file) => file.path)
  const confFiles: string[] = []
  for (const fileOrDir of confFilesOrDirs ?? []) {
    if (!fileOrDir) continue
    const path = await getAbsolutePaths(fileOrDir, '.txt')
    if (path) {
      for (const file of path) {
        confFiles.push(file)
      }
    }
  }
  return confFiles
}

const regexSearch = (
  document: vscode.TextDocument,
  regex: RegExp,
  diagnosticSeverity: DiagnosticSeverityKeys,
  message: string,
) => {
  const text = document.getText()
  const diagnostics: vscode.Diagnostic[] = []
  let match: RegExpExecArray | null | undefined = undefined
  while ((match = regex.exec(text)) !== null) {
    const startPos = document.positionAt(match.index)
    const endPos = document.positionAt(match.index + match[0].length)
    const range = new vscode.Range(startPos, endPos)
    const diagnostic = new vscode.Diagnostic(
      range,
      `${message}: ${match[0]}`,
      vscode.DiagnosticSeverity[diagnosticSeverity],
    )
    diagnostics.push(diagnostic)
  }
  collection.set(document.uri, diagnostics)
}

export const updateDiagnostics = async (document: vscode.TextDocument) => {
  try {
    const confFiles = await getConfFiles()
    if (confFiles?.includes(document.fileName)) return
    if (!targetFiles.includes(document.languageId)) return
    wordsMap.forEach((words, key) => {
      const keys = key.split('.')
      const diagnosticSeverity = keys[0] as DiagnosticSeverityKeys
      const message = keys.slice(1).join('.')
      const regex = new RegExp(`(${words.join('|')})`, 'g')
      regexSearch(document, regex, diagnosticSeverity, message)
    })
  } catch (error) {
    console.error(error)
  }
}

/**
 * key is `${diagnosticSeverity}.${message}`
 */
const wordsMap = new Map<string, string[]>()

export const clearWords = () => {
  wordsMap.clear()
  collection.clear()
}

export const addWords = (
  words: string[],
  message: string,
  diagnosticSeverity: DiagnosticSeverityKeys,
) => {
  words = words.filter((word) => word.trim())
  wordsMap.set(`${diagnosticSeverity}.${message}`, words)
}
