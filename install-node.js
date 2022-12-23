const childProcess = require('child_process')
const fs = require('fs')

const nodeVersion = fs.readFileSync('.nvmrc', 'utf8').trim()

const command = 'nvm install ' + nodeVersion + ' && nvm use ' + nodeVersion
console.log('executing command: ' + command)
childProcess.exec(command, function (error, stdout, stderr) {
  if (stdout) console.log(stdout.toString())
  if (stderr) console.error(stderr.toString())
  if (error) console.error(error)
})
