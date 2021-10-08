# Encrypted File Share

<details open>
    <summary>Table of Contents</summary>

    * [Demo](#demo)
    * [Run Locally](#run-locally)
    * [Tech Stack](#tech-stack)
    * [Automatically Generating Changelog](#automatically-generating-changelog)
    * [Changelog](#changelog)
    * [Authors](#authors)

</details>

Proof-of-concept application built using NextJS, Express and SocketIO to enable secure file sharing between sender and receiver

## Demo

{insert demo section here}

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

## Tech Stack

**Client**: [NextJS](http://nextjs.org), [ChakraUI](http://chakra-ui.com)

**Server**: Node, Express

## To Automatically Generate Changelog

We are following [Conventional Commits](https://conventionalcommits.org/) and [standart-version](https://github.com/conventional-changelog/standard-version) to help us automatically generate Changelog.

Run the following command to generate Changelog

```bash
npm run release
```

## Changelog

[Click here to view Changelog](./CHANGELOG.md)

## Authors

#### Okkar Min

<img src="https://avatars.githubusercontent.com/u/24297303?s=50&v=4" alt="okkar"  />

- [Website](https://okkarm.in)
- [GitHub](https://github.com/OkkarMin)

#### Yeow Ying Sheng

<img src="https://avatars.githubusercontent.com/u/70012669?s=50&v=4" alt="yingsheng"  />

- [WebSite](https://yeowys.com)
- [GitHub](https://github.com/dannyyys)
