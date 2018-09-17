
import { join, relative } from 'path'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { RepoContainer } from '../../config/types/Container'
import { Profile } from '../../config/types/Profile'

import {
  containers,
  containerNames,
  containersDir,
  getContainerDir,
  ContainerName,
} from '../../config/containers'

export class FetchError extends Error {
  constructor (message: string) {
    super(message)
  }
}

export const UNRECOGNIZED_CONTAINER = 'Unrecognized container'
export const NON_REPO_CONTAINER = 'Not a RepoContainer'
export const GIT_FETCH_FAILED = 'Failed to `git fetch`'
export const GIT_MERGE_FAILED = 'Failed to `git merge`'

interface Options {
  cloneOnly?: boolean
  gitCommand?: string
}

export function fetchContainer (
  containerName: ContainerName,
  {
    cloneOnly = false,
    gitCommand = 'git',
  }: Options = {},
) {
  const containerDir = getContainerDir(containerName)

  if (!(containerName in containers)) {
    console.error(`Unrecognized container ${containerName}.`)
    console.error(`Valid containers are: [${containerNames.join(', ')}]`)
    throw new FetchError(UNRECOGNIZED_CONTAINER)
  }

  const container = containers[containerName] as RepoContainer<Profile<any>, any>

  if (!(container instanceof RepoContainer)) {
    console.error(`You can only fetch containers which are RepoContainers.`)
    console.error(`Container ${containerName} is not a RepoContainer.`)
    throw new FetchError(NON_REPO_CONTAINER)
  }

  const { repo } = container

  if (!existsSync(containersDir)) {
    const relativeDir = relative(join(__dirname, '..'), containerDir)
    console.log(`Directory ${relativeDir} does not exist; creating...`)
    mkdirSync(containersDir)
    console.log('Directory created.')
  }

  if (!existsSync(containerDir)) {
    console.log(`Container ${containerName} does not exist; cloning...`)
    execSync(`${gitCommand} clone ${repo} ${containerName}`, {
      cwd: containersDir,
      stdio: 'inherit',
    })
    console.log(`Container cloned.`)
    return
  } else if (cloneOnly) {
    console.log(`Container "${containerName}" already exists.`)
    return
  }

  console.log(`Fetching latest for ${containerName}...`)
  try {
    execSync(`${gitCommand} fetch --all`, {
      cwd: containerDir,
      stdio: 'inherit',
    })
  } catch (err) {
    console.error('Something went wrong while fetching:')
    console.error(err)
    throw new FetchError(GIT_FETCH_FAILED)
  }

  console.log('Attempting to merge...')
  try {
    execSync(`${gitCommand} merge FETCH_HEAD --no-edit`, {
      cwd: containerDir,
      stdio: 'inherit',
    })
  } catch (_err) {
    try {
      execSync(`${gitCommand} merge --abort`, {
        cwd: containerDir,
        stdio: 'ignore',
      })
    } catch (_err) { /* noop */ }
    throw new FetchError(GIT_MERGE_FAILED)
  }

}
