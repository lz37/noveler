import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import Commands from '@/state/Commands'
import { handlePath } from '@/utils'

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
    const path = await handlePath(fileOrDir, '.txt')
    if (path) {
      for (const file of path) {
        confFiles.push(file)
      }
    }
  }
  return confFiles
}

export const updateDiagnostics = async (document: vscode.TextDocument) => {
  const text = document.getText()
  const confFiles = await getConfFiles()
  if (confFiles?.includes(document.fileName)) return
  if (!targetFiles.includes(document.languageId)) return
  wordsMap.forEach((words, { message, diagnosticSeverity }) => {
    const regex = new RegExp(`(${words.join('|')})`, 'g')
    const diagnostics: vscode.Diagnostic[] = []
    let match: RegExpExecArray | null
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
  })
}

const wordsMap = new Map<
  { message: string; diagnosticSeverity: DiagnosticSeverityKeys },
  string[]
>()

export const clearWords = () => {
  wordsMap.clear()
  collection.clear()
}

export const addWords = (
  words: string[],
  message: string,
  diagnosticSeverity: DiagnosticSeverityKeys,
) => {
  wordsMap.set({ message, diagnosticSeverity }, words)
}
