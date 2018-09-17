
import { spawn } from 'child_process'
import { join } from 'path'
import * as through from 'through2'

import { containerNames, containers } from '../config/containers'

// No typedefs available, and typescript complains.
// Importing the old-fashioned way to circumvent this.
const stripAnsi = require('strip-ansi')
const split = require('split')
const { Spinner } = require('cli-spinner')
const spinner = new Spinner('Waiting for containers... %s')
const opn = require('opn')

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
    checkForDone(lineBuffer.toString())
    if (startsDone.length >= startCount) {
      done()
    }
    next()
  }))

const procRgx = /^([^_]+)[^|]*\|(.+)$/ // "container_1  | some message here"
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
    spinner.stop(true)
    console.log(`Container ${containerName} started!`)
    spinner.start()
    startsDone.push(containerName)
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

spinner.start()
