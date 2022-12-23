import * as vscode from 'vscode'
export const isPlaintext = (editor: vscode.TextEditor) => {
  return editor.document.languageId === 'plaintext'
}
