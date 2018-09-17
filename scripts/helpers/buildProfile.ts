
import { uniqBy } from 'lodash'
import { Container } from '../../config/types/Container'
import { IProfileData, IProfileArgs } from '../../config/types/Profile'
import { getContainerDir } from '../../config/containers'

export function buildProfile (
  containerName: string,
  {
    profile,
    profileArgs,
    profileOverride,
  }: Container,
) {
  const baseArgs: IProfileArgs = {
    containerDir: getContainerDir(containerName),
    containerName,
  }

  let builtData: any = profile({
    ...baseArgs,
    ...profileArgs,
  })

  if (profileOverride) {
    builtData = mergeProfileData(builtData, profileOverride)
  }

  return builtData
}

function mergeProfileData (base: IProfileData, merge: IProfileData) {
  const portsObj = base.ports || merge.ports
                 ? { ...base.ports, ...merge.ports } as any
                 : undefined

  let ports: string[] | undefined = undefined
  if (portsObj) {
    ports = Object.keys(portsObj).map(sourcePort => {
      const destinationPort = portsObj[sourcePort]
      return `${sourcePort}:${destinationPort}`
    })
  }

  return cleanup({
    ...base,
    ...merge,
    build: base.build || merge.build ? {
      ...base.build,
      ...merge.build,
    } : undefined,
    ports,
    networks: mergeArrays(base.networks, merge.networks),
    volumes: mergeArrays(base.volumes, merge.volumes),
    depends_on: mergeArrays(base.depends_on, merge.depends_on),
  })
}

function mergeArrays<T> (arr1?: T[], arr2?: T[]): T[] | undefined {
  let output = arr1 || arr2
  if (arr1 && arr2) {
    output = uniqBy([...arr1, ...arr1], i => i)
  }

  if (output && output.length === 0) {
    output = undefined
  }

  return output
}

function cleanup (obj: any) {
  obj = { ...obj }
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key]
    }
  })
  return obj
}
