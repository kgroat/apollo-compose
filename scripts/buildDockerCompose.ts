
import { dump } from 'js-yaml'
import { writeFileSync } from 'fs'
import { join, relative } from 'path'
import { IProfileData } from '../config/types/Profile'
import { containers, containerNames, ContainerName } from '../config/containers'
import { buildProfile } from './helpers/buildProfile'
import { parseVolume } from './helpers/parseVolume'

console.log('Compiling the data...')
const dockerComposeLocation = join(__dirname, '../docker-compose.yml')

const services: { [key in ContainerName]?: IProfileData } = {}
const volumes: { [key: string]: {} } = {}
const networks: { [key: string]: {} } = {}

function rebuildVolumes (newVolumes: string[]) {
  return newVolumes.map(volumeString => {
    const { sourceLocation, isNamedVolume, definition } = parseVolume(volumeString)
    if (isNamedVolume) {
      volumes[sourceLocation] = {}
    }
    return definition
  })
}

function addNetworks (newNetworks: string[]) {
  newNetworks.forEach(network => {
    networks[network] = {}
  })
}

containerNames.forEach(containerName => {
  const container = containers[containerName]
  const profile = buildProfile(containerName, container)
  services[containerName] = profile
  if (profile.volumes) {
    profile.volumes = rebuildVolumes(profile.volumes)
  }
  if (profile.networks) {
    addNetworks(profile.networks)
  }
})

console.log('Converting to yml...')
let content: string
try {
  content = dump({
    services,
    volumes,
    networks,
  }, {
    flowLevel: -1,
    lineWidth: 200,
    noRefs: true,
    noCompatMode: true,
  })

  const emptyObjRgx = /^(\s*[\w-_]+):\s*\{\}$/
  const emptyObjRgxGlobal = new RegExp(emptyObjRgx, 'gm')
  content = content.replace(emptyObjRgxGlobal, (s) => {
    const [_, name] = emptyObjRgx.exec(s)!
    return `${name}:`
  })

  const quotedStringRgx = /^([^']+)'([^']+)'/
  const quotedStringRgxGlobal = new RegExp(quotedStringRgx, 'gm')
  content = content.replace(quotedStringRgxGlobal, (s) => {
    const [_, prefix, content] = quotedStringRgx.exec(s)!
    return `${prefix}${content}`
  })
  content = `version: '3.4'\n${content}`
} catch (err) {
  console.error('Something went wrong while trying to serialize the yml:')
  console.error(err)
  process.exit(1)
}

console.log(`Writing to \`${relative(process.cwd(), dockerComposeLocation)}\`...`)
try {
  writeFileSync(dockerComposeLocation, content!)
} catch (err) {
  console.error('Something went wrong while trying to write the docker-compose.yml file:')
  console.error(err)
  process.exit(1)
}

console.log('Done!')
