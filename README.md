# Encrypted File Share

Proof-of-concept application built using NextJS, Express and SocketIO to enable secure file sharing between sender and receiver

## Run Locally (for development)

Clone the project

```bash
git clone https://github.com/OkkarMin/encrypted-file-share-applied-cryptography/tree/main
```

Go to the project directory

```bash
cd encrypted-file-share-applied-cryptography
```

Install dependencies

```bash
npm install
```

At this point there is two app you need to run

1. socket-server and
2. nextjs client

you need to open two terminals

### 1. Start socket-server

```bash
cd socket-server
npm run watch
```

Go to http://localhost:2000 to check socket-server is running

### 2. nextjs-client

```bash
cd nextjs-client
npm run dev
```

Go to http://localhost:3000 to check NextJs is running
