# Encrypted File Share

<details open>
    <summary>Table of Contents</summary>
<ul>
    <li><a href="#demo">Demo</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#folder-and-file-structure">Folder And File Structure</a></li>
    <li><a href="#run-locally-for-development">Run Locally (for development)</a></li>
    <li><a href="#hosting-for-production">Hosting (for production)</a></li>
    <li><a href="#automatically-generating-changelog">Automatically Generating Changelog</a></li>
    <li><a href="#changelog">Changelog</a></li>
    <li><a href="#todo">TODO</a></li>
    <li><a href="#authors">Authors</a></li>
</ul>
</details>
<p>

Proof-of-concept application built using NextJS, Express and SocketIO to enable secure file sharing between sender and receiver

## Demo

{insert demo section here}

## Tech Stack

**Client**: [NextJS](http://nextjs.org), [ChakraUI](http://chakra-ui.com)

**Server**: Node, Express

## Folder And File Structure

{insert folder/file tree section here}

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

## Hosting (for production)

{insert dockerzing and docker-composing section here}

## Automatically Generating Changelog

We are following [Conventional Commits](https://conventionalcommits.org/) and [standart-version](https://github.com/conventional-changelog/standard-version) to help us automatically generate Changelog.

Run the following command to generate Changelog

```bash
npm run release
```

## Changelog

[Click here to view Changelog](./CHANGELOG.md)

## TODO

- [x] Encrypted text messaging between two clients
- [ ] Encrypted file sharing between two clients
- [ ] UI Improvements
  - [ ] Shows who is online in the room currently
  - [ ] Shows what % of uploaded/downloaded file
- [ ] Hosting on AWS Elastic Bean Stalk with HTTPS certificate

## Authors

|                                                 Name                                                  | Website            | Github                      |
| :---------------------------------------------------------------------------------------------------: | ------------------ | --------------------------- |
|   <img src="https://avatars.githubusercontent.com/u/24297303?s=50&v=4" alt="okkar"/><br> Okkar Min    | https://okkarm.in  | https://github.com/OkkarMin |
| <img src="https://avatars.githubusercontent.com/u/70012669?s=50&v=4" alt="yingsheng"/><br> Ying Sheng | https://yeowys.com | https://github.com/dannyyys |
