
import * as yargsOrig from 'yargs'
import { RepoContainer } from '../config/types/Container'
import { containers, containerNames, ContainerName } from '../config/containers'
import { fetchContainer } from './helpers/containerFetcher'

let yargs = yargsOrig
.option('clone', {
  alias: ['c', 'only-clone'],
  describe: 'Only attempt to clone container; if it exists, do nothing.',
  type: 'boolean',
})
.command('all', 'Pull all of the containers.')

containerNames.forEach(containerName => {
  const container = containers[containerName]
  if (container instanceof RepoContainer) {
    yargs = yargs.command(containerName, `Pull the ${containerName} container.`)
  }
})

const argv = yargs
.demandCommand(1, 'Please specify one or more container name(s).')
.argv

let containersToFetch = argv._ as ContainerName[]
const cloneOnly = argv.clone as boolean
const gitCommand = process.env.GIT || 'git'

if ((containersToFetch as string[]).indexOf('all') >= 0) {
  containersToFetch = containerNames.filter(name => (
    containers[name] instanceof RepoContainer
  ))
}

containersToFetch.forEach(name => {
  fetchContainer(name, {
    cloneOnly,
    gitCommand,
  })
})
