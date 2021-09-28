# Encrypted File Share

Proof-of-concept application built using NextJS, Express and SocketIO to enable secure file sharing between sender and receiver

## Run Locally (for development)

Clone the project

```bash
git clone https://github.com/OkkarMin/encrypted-file-share-applied-cryptography
```

Go to the project directory

```bash
cd encrypted-file-share-applied-cryptography
```

Install dependencies

```bash
npm run installDeps
```

Run command below to run both socket-server and nextjs-client

```bash
npm run dev
```

- nextjs-client : http://localhost:3000
- socket-server : http://localhost:2000

## To Automatically Generate Changelog

We are following [Conventional Commits](https://conventionalcommits.org/) and [standart-version](https://github.com/conventional-changelog/standard-version) to help us automatically generate Changelog.

Run the following command to generate Changelog

```bash
npm run release
```

## Changelog

[Click here to view Changelog](./CHANGELOG.md)
