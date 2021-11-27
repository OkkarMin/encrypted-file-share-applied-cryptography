import io, { Socket } from "socket.io-client";

import { IMessageObject, IAsymmetricMessageObject } from "../../interface";

let socket: Socket;

let listOfConnectedUsers: any;
const setListOfConnectedUsers = (newList: any) =>
  (listOfConnectedUsers = newList);

let publicKey: any;
const setPublicKey = (newKey: any) => (publicKey = newKey);

let privateKey: any;
const setPrivateKey = (newKey: any) => (privateKey = newKey);

let sharedKey: any;
const setSharedKey = (newKey: any) => (sharedKey = newKey);

let publicVerifyingKey: any;
const setPublicVerifyingKey = (newKey: any) => (publicVerifyingKey = newKey);

let privateSigningKey: any;
const setPrivateSigningKey = (newKey: any) => (privateSigningKey = newKey);

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

        await window.crypto.subtle
          .generateKey(
            {
              name: "RSASSA-PKCS1-v1_5",
              modulusLength: 4096,
              publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
              hash: {
                name: "SHA-256",
              },
            },
            true,
            ["sign", "verify"]
          )
          .then(async (keys) => {
            setPublicVerifyingKey(keys.publicKey);
            setPrivateSigningKey(keys.privateKey);

            const exportedPublicVerifyingKey =
              await window.crypto.subtle.exportKey("jwk", keys.publicKey);

            // send exportable public key to server
            if (
              socket &&
              room &&
              exportedPublicKey &&
              exportedPublicVerifyingKey
            )
              socket.emit("join", {
                room,
                exportedPublicKey,
                exportedPublicVerifyingKey,
              });
          });
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
    setListOfConnectedUsers(listOfUsers);
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
  createdSharedKey: any,
  room: string
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

  // sign shared key
  const signature = await window.crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateSigningKey,
    encryptedSharedKey
  );

  socket.emit("sendSharedKey", {
    sendToTarget,
    encryptedSharedKey,
    signature,
    room,
  });
};

// receipient to recieve shared key from socket
const receieveSharedKey = (cb: Function) => {
  if (!socket) return true;

  socket.on("recieveSharedKey", async (data: any) => {
    const { sendToTarget, encryptedSharedKey, signature, room } = data;

    // conert public key of sender to usable format
    const sendToTargetUsableVerifyingPublicKey =
      await window.crypto.subtle.importKey(
        "jwk",
        listOfConnectedUsers[room][sendToTarget].exportedPublicVerifyingKey,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: { name: "SHA-256" },
        },

        false,
        ["verify"]
      );

    // verify signature of shared key
    const verified = await window.crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      sendToTargetUsableVerifyingPublicKey,
      signature,
      encryptedSharedKey
    );

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

    return importDecryptedSharedKey && verified
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
    let verified: boolean;

    try {
      const importsenderPublicVerifyingKey =
        await window.crypto.subtle.importKey(
          "jwk",
          listOfConnectedUsers[messageObject.room][messageObject.senderID]
            .exportedPublicVerifyingKey,
          {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" },
          },
          false,
          ["verify"]
        );

      // verify if encrypted message is authentic
      verified = await window.crypto.subtle.verify(
        "RSASSA-PKCS1-v1_5",
        importsenderPublicVerifyingKey,
        messageObject.signature,
        Buffer.from(messageObject.body)
      );

      // decrypt message
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
      verified,
    };

    // if message not decrypted, change body to "not for you"
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
  let signature: any;

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

    signature = await window.crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      privateSigningKey,
      encryptedMessage
    );
  } catch (error) {
    console.log("error", error);
  }

  const encryptedMessageObject: IAsymmetricMessageObject = {
    ...messageObject,
    body: encryptedMessage,
    iv,
    signature,
    room,
    senderID: socket.id,
  };

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
