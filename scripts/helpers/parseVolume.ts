
import { relative, join } from 'path'

export interface IVolumeData {
  sourceLocation: string
  mountLocation: string
  flags: string
  isNamedVolume: boolean
  definition: string
}

const volumeRgx = /^([^:]+):([^:]+)(?::([^:]+))?$/
export function parseVolume (volumeString: string): IVolumeData {
  const match = volumeRgx.exec(volumeString)
  if (!match) {
    throw new Error(`Malformed volume string: "${volumeString}"`)
  }

  let [_, sourceLocation, mountLocation, flags = ''] = match
  const isNamedVolume = sourceLocation[0] !== '.' && sourceLocation[0] !== '/'
  let definition = `${sourceLocation}:${mountLocation}`
  if (!isNamedVolume) {
    sourceLocation = relative(join(__dirname, '../..'), sourceLocation)
    definition = `./${sourceLocation}:${mountLocation}`
  }

  if (flags.length > 0) {
    definition = `${definition}:${flags}`
  }

  return {
    sourceLocation,
    mountLocation,
    flags,
    isNamedVolume,
    definition,
  }
}
