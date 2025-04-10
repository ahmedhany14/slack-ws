<br />
<p align="center">

  <h3 align="center"> Slack-WebSocket </h3>
</p>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description](#description)
- [Features](#features)
- [Technologies](#technologies)
- [Project setup](#project-setup)
- [Compile and run the project](#compile-and-run-the-project)
- [Run tests](#run-tests)
- [Usage](#usage)
- [License](#license)

## Description

This project is a backend application designed to provide real-time communication between users, similar to Slack. The
system will consist of multiple servers, each containing various chat rooms. The platform will have user chat rooms, as
well as special chat rooms for administrators, allowing efficient and scalable communication for both regular users and
admins.

## Features

- **Servers**: Multiple servers to handle communication between users.
- **Chat Rooms**: Each server will have multiple chat rooms, where users can communicate in real-time.
- **User and Admin Chats**: Separate chat rooms for users and admins to ensure smooth communication and management.
- **Real-time Communication**: Powered by WebSocket technology for instant message delivery.
- **Scalable Architecture**: Designed to scale across multiple servers and chat rooms.
- **Authentication**: User authentication for joining chats and managing their connections.
- **Moderation**: Admins can monitor, moderate, and manage chat rooms and users.

## Technologies

- **WebSocket**: For real-time, two-way communication.
- **Node.js**: For handling the server-side logic and WebSocket connections.
- **Socket.IO**: A library for real-time web applications.
- **NestJs**: For setting up the server and routing.
- **JWT (JSON Web Token)**: For user authentication and session management.

## Project setup

1. Clone the repository:

```bash
$ git https://github.com/ahmedhany14/slack-ws.git
$ cd slack-ws
```

2. Install dependencies:

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Usage
* **WebSocket Server**: The backend will expose WebSocket connections for users and admins to join different chat rooms.
* **Admin Control**: Admins can monitor and control all the chat rooms, manage users, and send system-wide
  announcements.
* **User Interaction**: Regular users can join specific chat rooms and interact with each other in real time.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
