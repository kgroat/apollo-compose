
const chalk = require('chalk')
// const { concurrent } = require('nps-utils')

module.exports = {
  scripts: {
    default: {
      script: 'nps docker.createFile docker.start',
      description: 'Build and start all apps using `docker-compose` in a detached process.',
    },
    restart: {
      script: 'nps docker.down docker.start'
    },
    attached: {
      script: 'nps docker.createFile docker.up',
      description: 'Build and start all apps using `docker-compose`.',
    },
    docker: {
      createFile: {
        script: 'ts-node ./scripts/buildDockerCompose.ts',
        description: 'Create `docker-compose.yml`.',
      },
      build: {
        script: 'docker-compose build',
        description: 'Build all of the containers.',
      },
      start: {
        script: 'ts-node ./scripts/spinUp.ts',
        description: 'Spin up all of the containers in a background process and open a browser.'
      },
      up: {
        script: 'docker-compose up',
        description: 'Spin up all of the containers.',
      },
      down: {
        script: 'docker-compose down',
        description: 'Spin down all of the containers.',
      },
    },
    git: {
      clone: {
        script: 'ts-node ./scripts/fetchContainer.ts -c',
        description: `Clone specific container(s). ${usage('npm start "git.clone server"')}`,
        all: {
          script: 'ts-node ./scripts/fetchContainer.ts -c all',
          description: `Clone all containers.`,
        }
      },
      pull: {
        script: 'ts-node ./scripts/fetchContainer.ts',
        description: `Fetch and merge specific container(s). ${usage('npm start "git.pull server"')}`,
        all: {
          script: 'ts-node ./scripts/fetchContainer.ts all',
          description: `Clone all containers.`,
        }
      },
    },
    lint: {
      script: 'tslint --project .',
      description: 'Lints the code in this project.',
    },
  },
}

function usage (instructions) {
  return chalk.bgBlack(chalk.green.underline.bold('Usage:'), chalk.blue(instructions))
}
