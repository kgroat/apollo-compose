
Proxy.prototype = Object.create(Object.prototype)

export class Profile<T> extends Proxy<IProfile<T>> implements IProfile<T> {
  constructor (
    func: IProfile<T>,
  ) {
    const handler = {}
    super(func, handler)
  }
}

export interface IProfileData {
  image?: string
  build?: {
    context?: string
    dockerfile?: string
    args?: { [arg: string]: string },
  }
  ports?: { [key: number]: number }
  networks?: string[]
  entrypoint?: string
  command?: string
  working_dir?: string
  environment?: { [env: string]: string }
  volumes?: string[]
  depends_on?: string[]
  healthcheck?: {
    test: string[]
    interval?: string
    timeout?: string
    retries?: number,
  }
}

export interface IProfile<T> {
  (args: IProfileArgs & T): IProfileData
  argType?: T
}

export interface IProfileArgs {
  containerDir: string
  containerName: string
}
