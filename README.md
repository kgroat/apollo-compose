# Apollo Graphql/React Starter Project

## Purpose
This repository serves as a single point to work with the Apollo starter project.  As a part of running `npm install`, it will automatically clone the dependent projects into the same directory that this project is cloned into, alongside it.

## Prerequisites
* Node LTS ([download](https://nodejs.org/en/download/))
* Docker ([download](https://www.docker.com/get-started))

## Quickstart

### Dependency installation
To install the dependencies and clone the requisite container projects, run:
```bash
$ npm install
```

### Starting the containers
To generate a `docker-compose.yml` file and spin up all of the containers using `docker-compose up`, run:
```bash
$ npm start
```

This will start all of the containers in a detached process.  Once the containers are running, it will also attempt to open a browser window to the application.

If you wish instead to run the apps and see all of the logs, you can run:
```bash
$ npm start attached
```

In addition, once the `docker-compose.yml` file is generated, you can use the `docker-compose` command with [its CLI](https://docs.docker.com/compose/reference/overview/)

### Interactive scripts
To view all available scripts, run:
```bash
$ npm run interactive
```

## Containers
* `server`
  * A graphql server built using `apollo-server`.
  * To explore the graphql schema using the browser IDE, you can go to: `http://localhost:3001`.
  * Code lives in the `server` directory next to this one, once cloned.
* `client`
  * A react application that talks to the backend using `react-apollo`.
  * Code lives in the `client` directory next to this one, once cloned.
* `proxy`
  * An nginx server used to route requests to the client and server.
  * Runs on port 80, so that the app can be seen at `http://localhost/`.
  * The `nginx.conf` lives in docker-support.
* `database`
  * A `mongodb` database only available to the `server` container.
  * Does **not** expose a public port.

### More info & development
For more information about how to develop the container applications, you can see the readme's for:
* `server` - [apollo-graphql-starter](https://github.com/kgroat/apollo-graphql-starter)
* `client` - [apollo-react-starter](https://github.com/kgroat/apollo-react-starter)

## Using this as a starter project
Once you've cloned the project, most of the information about each container can be found in [config/containers.ts](./config/containers.ts) or [config/containerProfiles.ts](./config/containerProfiles.ts).  The rest of this repository is largely supporting scripts or files that get added to the containers.
