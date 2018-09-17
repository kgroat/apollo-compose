
import { IProfileData, Profile } from './Profile'

export type Container = RepoContainer<Profile<any>, any>
               | CommonContainer<Profile<any>, any>

export class CommonContainer<P extends Profile<T>, T> implements ICommonContainer<P, T> {
  profile: P
  profileArgs: P['argType']
  profileOverride?: IProfileData
  startMessage?: string

  constructor ({
    profile,
    profileArgs,
    profileOverride,
    startMessage,
  }: ICommonContainer<P, T>,
  ) {
    this.profile = profile
    this.profileArgs = profileArgs
    this.profileOverride = profileOverride
    this.startMessage = startMessage
  }
}

export class RepoContainer<P extends Profile<T>, T> extends CommonContainer<P, T> implements IRepoContainer<P, T> {
  repo: string

  constructor (
    { repo, ...common }: IRepoContainer<P, T>,
  ) {
    super(common)
    this.repo = repo
  }
}

export interface ICommonContainer<P extends Profile<T>, T> {
  profile: P
  profileArgs: P['argType']
  profileOverride?: IProfileData
  startMessage?: string
}

export interface IRepoContainer<P extends Profile<T>, T> extends ICommonContainer<P, T> {
  repo: string
}

export type IContainerMap = {
  [containerName: string]: Container,
}
