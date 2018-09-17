
import { Profile, IProfileArgs } from './types/Profile'

export const profiles = {
  node: new Profile((
    {
      mainPort,
      containerDir,
      containerName,
    }: IProfileArgs & { mainPort: number },
  ) => ({
    build: {
      context: '.',
      dockerfile: require.resolve('../dockerfiles/node.dockerfile'),
      args: {
        USER_UID: '${USER_UID}',
      },
    },
    command: 'npm start',
    entrypoint: '/usr/local/bin/entrypoint.sh',
    working_dir: '/app',
    volumes: [
      `${containerDir}:/app`,
      `npm_cache:/home/.npm`,
      `${containerName}-node_modules:/app/node_modules`,
    ],
    healthcheck: {
      test: ['CMD', 'curl', '-f', `http://localhost:${mainPort}`],
      interval: '5s',
      timeout: '5s',
      retries: 20,
    },
  })),
  nginx: new Profile((
    {
      mainPort,
    }: IProfileArgs & { mainPort: number },
  ) => ({
    image: 'nginx:1.15-alpine',
    volumes: [
      `${require.resolve('../docker-support/nginx.conf')}:/etc/nginx/nginx.conf:ro`,
    ],
    healthcheck: {
      test: ['CMD', 'curl', '-f', `http://localhost:${mainPort}`],
      interval: '5s',
      timeout: '5s',
      retries: 20,
    },
  })),
  mongodb: new Profile<{}>((
    {
      containerName,
    }: IProfileArgs,
  ) => ({
    image: 'mongo:4.1.2',
    volumes: [
      `${containerName}-mongo-db:/data/db`,
      `${containerName}-mongo-configdb:/data/configdb`,
    ],
  })),
}
