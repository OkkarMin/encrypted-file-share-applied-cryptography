import io, { Socket } from "socket.io-client";

import { IMessageObject, IAsymmetricMessageObject } from "../../interface";

import { toBase64 } from "../utils/toBase64";

let socket: Socket;

let publicKey: any;
const setPublicKey = (newKey: any) => (publicKey = newKey);
let privateKey: any;
const setPrivateKey = (newKey: any) => (privateKey = newKey);
let sharedKey: any;
const setSharedKey = (newKey: any) => (sharedKey = newKey);

const initiateSocket = async (room: string) => {
  const socketServer =
    process.env.NODE_ENV == "production"
      ? "encrypted-fileshare.ml"
      : "localhost:2000";
  socket = io(`${socketServer}`);
  console.log(`Connecting socket...`);

  const generateKeyPair = async () => {
    await window.crypto.subtle
      .generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: {
            name: "SHA-256",
          },
        },
        true,
        ["encrypt", "decrypt"]
      )
      .then(async (keys) => {
        setPublicKey(keys.publicKey);
        setPrivateKey(keys.privateKey);

        const exportedPublicKey = await window.crypto.subtle.exportKey(
          "jwk",
          keys.publicKey
        );

        // send exportable public key to server
        if (socket && room && exportedPublicKey)
          socket.emit("join", { room, exportedPublicKey });
      });
  };

  generateKeyPair();
};

const disconnectSocket = () => {
  console.log("Disconnecting socket...");

  if (socket) socket.disconnect();
};

const connectedUsers = (cb: Function) => {
  if (!socket) return true;

  socket.on("listOfUsers", (listOfUsers: any) => {
    console.log("listOfUsers", listOfUsers);
    return listOfUsers ? cb(null, listOfUsers, socket.id) : cb(null, {});
  });
};

// create sharedkey
const makeSharedKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  setSharedKey(key);

  return key;
};

// function to send sharedkey and recipient to socket
const sendSharedKey = async (
  sendToTarget: string,
  sendToTargetPublicKey: any,
  createdSharedKey: any
) => {
  // convert shared key to exportable format
  const exportableSharedKey = await window.crypto.subtle.exportKey(
    "raw",
    createdSharedKey
  );

  // import public key of receipient
  const sendToTargetUsablePublicKey = await window.crypto.subtle.importKey(
    "jwk",
    sendToTargetPublicKey,
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" },
    },
    false,
    ["encrypt"]
  );

  // encrypt exportable shared key with receipient public key
  const encryptedSharedKey = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    // receipient public key
    sendToTargetUsablePublicKey,
    exportableSharedKey
  );

  socket.emit("sendSharedKey", { sendToTarget, encryptedSharedKey });
};

// receipient to recieve shared key from socket
const receieveSharedKey = (cb: Function) => {
  if (!socket) return true;

  socket.on("recieveSharedKey", async (encryptedSharedKey: any) => {
    // decrypt shared key using receipient private key
    const decryptedSharedKey = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      // receipient private key
      privateKey,
      encryptedSharedKey
    );

    // convert to decryped shared key to usable format
    const importDecryptedSharedKey = await window.crypto.subtle.importKey(
      "raw",
      decryptedSharedKey,
      {
        name: "AES-CBC",
        length: 256,
      },
      false,
      ["decrypt"]
    );

    setSharedKey(importDecryptedSharedKey);

    return importDecryptedSharedKey
      ? cb(null, importDecryptedSharedKey)
      : cb(null, {});
  });
};

const subscribeToChat = async (cb: Function) => {
  if (!socket) return true;

  socket.on("chat", async (messageObject: IAsymmetricMessageObject) => {
    console.log("Websocket event received!");

    let utf8decoder = new TextDecoder();

    let plainBody: any;
    try {
      plainBody = await window.crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          length: 256,
          iv: messageObject.iv,
        },
        sharedKey,
        Buffer.from(messageObject.body)
      );
    } catch (error) {
      // if the key is wrong, we don't want to decrypt the message
      plainBody = undefined;
    }

    const decryptedMessageObject = {
      ...messageObject,
      body: utf8decoder.decode(plainBody),
    };

    const undecryptedMessageObject = {
      ...messageObject,
      body: "not for you",
    };

    console.log("messageObject", messageObject);

    return plainBody
      ? cb(null, decryptedMessageObject)
      : cb(null, undecryptedMessageObject); // cb(error, message)
  });
};

const sendAsymmetricMessage = async (
  room: string,
  messageObject: IMessageObject
) => {
  if (!socket) return true;

  console.log(messageObject, "messageObject");

  let encryptedMessage: any;

  console.log(Buffer.from(messageObject.body, "base64"), "bufeerrrr");

  const iv = window.crypto.getRandomValues(new Uint8Array(16));

  try {
    encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        length: 256,
        iv,
      },
      sharedKey,
      Buffer.from(messageObject.body)
    );
  } catch (error) {
    console.log("error", error);
  }

  console.log("encryptedMessage before sending", encryptedMessage);

  const encryptedMessageObject = {
    ...messageObject,
    body: encryptedMessage,
    iv,
  };

  console.log("encryptedMessageObject before sending", encryptedMessageObject);

  socket.emit("chat", {
    messageObject: encryptedMessageObject,
    room,
  });
};

export {
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendAsymmetricMessage,
  connectedUsers,
  makeSharedKey,
  sendSharedKey,
  receieveSharedKey,
};
