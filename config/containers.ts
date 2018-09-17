
import { join } from 'path'
import { RepoContainer, CommonContainer } from './types/Container'
import { profiles } from './containerProfiles'

export const containersDir = join(__dirname, '../..')
export const getContainerDir = (containerName: string) => join(containersDir, containerName)

export const containers = {
  server: new RepoContainer({
    repo: 'git@github.com:kgroat/apollo-graphql-starter.git',
    profile: profiles.node,
    profileArgs: {
      mainPort: 3001,
    },
    profileOverride: {
      command: 'npm start dev',
      ports: {
        3001: 3001,
        9222: 9222, // debug port
      },
      environment: {
        PORT: '3001',
        MONGO_URI: 'mongodb://database/apollo-server',
      },
      networks: ['db', 'proxy'],
    },
    startMessage: 'server listening on port',
  }),
  client: new RepoContainer({
    repo: 'git@github.com:kgroat/apollo-react-starter.git',
    profile: profiles.node,
    profileArgs: {
      mainPort: 3000,
    },
    profileOverride: {
      ports: {
        3000: 3000,
      },
      networks: ['proxy'],
    },
    startMessage: 'To create a production build, use npm run build.',
  }),
  proxy: new CommonContainer({
    profile: profiles.nginx,
    profileArgs: { mainPort: 80 },
    profileOverride: {
      depends_on: ['server', 'client'],
      ports: {
        80: 80,
      },
      networks: ['proxy'],
    },
  }),
  database: new CommonContainer({
    profile: profiles.mongodb,
    profileArgs: {},
    profileOverride: {
      networks: ['db'],
    },
    startMessage: 'waiting for connections on port 27017',
  }),
}

export type ContainerName = keyof typeof containers

export const containerNames = Object.keys(containers) as ContainerName[]
