
import { spawn, execSync } from 'child_process'
import { join, basename } from 'path'
import * as through from 'through2'
import chalk from 'chalk'

import { containerNames, containers } from '../config/containers'

// No typedefs available, and typescript complains.
// Importing the old-fashioned way to circumvent this.
const stripAnsi = require('strip-ansi')
const split = require('split')
const { Spinner } = require('cli-spinner')
const spinner = new Spinner('Waiting for containers... %s')
const opn = require('opn')

const projectDir = basename(join(__dirname, '..'))
let startCount = 0
const startMessages: { [key: string]: string } = {}
containerNames.forEach(name => {
  const container = containers[name]
  if (container.startMessage) {
    startCount++
    startMessages[name] = container.startMessage
  }
})
const startsDone: string[] = []

console.log('Starting containers...')
const child = spawn('docker-compose', ['up'], {
  cwd: join(__dirname, '..'),
  detached: true,
  stdio: 'pipe',
})

child.stdout
  .pipe(split())
  .pipe(through(function (lineBuffer, _, next) {
    const line = lineBuffer.toString()
    checkForDone(line)
    checkForExit(line)
    if (startsDone.length >= startCount) {
      done()
    }
    next()
  }))

// "container_1  | some message here"
const procRgx = /^([^_]+)[^|]*\|(.+)$/
function checkForDone (line: string) {
  const match = procRgx.exec(stripAnsi(line))

  // only match lines in the format above
  if (!match) {
    return
  }

  const [_, containerName, message] = match

  // only match containers that have a startMessage
  if (!(containerName in startMessages)) {
    return
  }

  // only match containers that haven't already started
  if (startsDone.indexOf(containerName) >= 0) {
    return
  }

  const startMessage = startMessages[containerName]

  // match if the line contains the target text
  if (message.indexOf(startMessage) >= 0) {
    log(`Container ${containerName} started!`)
    startsDone.push(containerName)
  }
}

// apollo-compose_client_1 exited with code 1
const exitRgx = new RegExp(`${projectDir}_(.+)_\\d+ exited with code (\\d+)`)
function checkForExit (ansiLine: string) {
  const line = stripAnsi(ansiLine)
  const match = exitRgx.exec(line)

  // only match lines in the format above
  if (!match) {
    return
  }

  const [_, containerName, exitCodeStr] = match

  const exitCode = parseInt(exitCodeStr, 10)
  const message = `Container ${containerName} exited with code ${exitCode}`

  if (exitCode > 0) {
    spinner.stop(true)
    console.error(chalk.bold.red(`Something went wrong with container "${containerName}"`))
    console.error(chalk.red(message))
    console.error()
    console.error(chalk.bold.yellow(`For more information run:`))
    console.error(chalk.yellow(`docker-compose logs ${containerName}`))
    console.error('\n')
    process.exit(exitCode)
  } else if (containerName in startMessages) {
    log(
      chalk.yellow(`Unexpected container exit:`),
      chalk.yellow(message),
    )
  } else {
    log(message)
  }
}

let isDone = false
function done () {
  if (isDone) {
    return
  }

  isDone = true
  spinner.stop(true)
  console.log('All containers successfully started!')
  console.log('You can go to `http://localhost/` to view the app.')
  opn('http://localhost/', { wait: false }).then(() => {
    process.exit(0)
  })
}

function log (...lines: string[]) {
  spinner.stop(true)
  lines.forEach(line => console.log(line))
  spinner.start()
}

spinner.start()
