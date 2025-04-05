import * as confHandler from '@/modules/ConfigHandler'
import * as vscode from 'vscode'
import { promises as fs } from 'fs'
import { isAbsolutePath, getAbsolutePaths, mkdirs } from 'common/utils'
import { Commands, ICustomHighlightConfMap } from 'common/types'
import { initing } from '@/extension'
import * as path from 'path'
async function readPaths(exportFilePath: string[]) {
  // 读取所有文件路径
  const targetFiles = []
  for (const path of exportFilePath) {
    const uris = await vscode.workspace.findFiles(path)
    targetFiles.push(...uris)
  }
  // 排序
  const sortedFiles = targetFiles.sort((a, b) => {
    const fileNameA = path.basename(a.fsPath)
    const fileNameB = path.basename(b.fsPath)
    return fileNameA.localeCompare(fileNameB)
  })
  return sortedFiles
}
async function readFiles(targetFiles: vscode.Uri[], encoding: BufferEncoding) {
  // 读取文件内容
  let text = ''
  for (const fileUri of targetFiles) {
    const { name } = path.parse(fileUri.fsPath)
    text += `\n\n\n${name}\n\n` // 插入章节名
    text += await fs.readFile(fileUri.fsPath, encoding)
  }
  return text
}
export const exportFile = async () => {
  if (vscode.workspace.workspaceFolders?.length != 1) {
    vscode.window.showErrorMessage(
      `导出文件暂不支持工作区多个文件夹，请选择一个文件夹进行导出`,
    )
  }
  const conf = confHandler.get()
  // 文件夹是否存在,如果不存在是否创建成功
  let exportOutPath = conf.exportOutPath
  let dirname = path.dirname(exportOutPath)
  if (!isAbsolutePath(dirname)) {
    dirname = `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/${dirname}`
    exportOutPath = `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/${exportOutPath}`
  }

  if (!(await mkdirs(dirname))) {
    return
  }

  const targetFiles = await readPaths(conf.exportFilePath) // 读取目标文件路径
  const text = await readFiles(
    targetFiles,
    conf.exportEncoding as BufferEncoding,
  )

  if (conf.exportFormat == 'txt') {
    await fs.writeFile(exportOutPath, text, {
      encoding: conf.exportEncoding as BufferEncoding,
    })
  } else {
    vscode.window.showErrorMessage(`不支持的导出格式: ${conf.exportFormat}`)
  }
  vscode.window.showInformationMessage(`导出成功: ${conf.exportOutPath}`)
}

export const exportCommand = vscode.commands.registerCommand(
  Commands.ExportTXT,
  () => {
    exportFile()
  },
)
