import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'

import { formatTime, isMultipleWorkspaces, mkdirs } from 'common/utils'
import { promises as fs, existsSync } from 'fs'

// 写入CSV文件的函数
export async function appendToCSV(count: number) {
  // 不支持多个工作区
  if (isMultipleWorkspaces()) {
    return
  }
  if (count == 0) {
    return
  }
  if (confHandler.get().typingRecord === false) {
    return
  }
  const noveler = `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/.noveler`

  await mkdirs(noveler)
  const csvFilePath = `${noveler}/record.log`

  const data = `${formatTime()},${count}\n`
  try {
    if (!existsSync(csvFilePath)) {
      // 如果文件不存在，先写入表头
      const header = '时间,计数\n'
      await fs.writeFile(csvFilePath, header)
    }
    await fs.appendFile(csvFilePath, data)
    // console.log('数据已成功追加到CSV文件')
  } catch (err) {
    console.error('写入CSV文件出错:', err)
  }
}
