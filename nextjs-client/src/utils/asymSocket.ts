import io, { Socket } from "socket.io-client";

import { IMessageObject, IAsymmetricMessageObject } from "../../interface";

let socket: Socket;

let publicKey: any;
const setPublicKey = (newKey: any) => (publicKey = newKey);
let privateKey: any;
const setPrivateKey = (newKey: any) => (privateKey = newKey);

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

  return key;
};

// function to send sharedkey and recipient to socket
const sendSharedKey = async (sendToTarget: string, sharedKey: any) => {
  const exportableSharedKey = await window.crypto.subtle.exportKey(
    "jwk",
    sharedKey
  );

  socket.emit("sendSharedKey", { sendToTarget, exportableSharedKey });
};

// receipient to recieve shared key from socket
const receieveSharedKey = (cb: Function) => {
  if (!socket) return true;

  socket.on("recieveSharedKey", async (exportableSharedKey: any) => {
    // convert exportableSharedKey into usable format
    const importSharedKey = await window.crypto.subtle.importKey(
      "jwk",
      exportableSharedKey,
      {
        name: "AES-CBC",
        length: 256,
      },
      false,
      ["decrypt"]
    );

    return importSharedKey ? cb(null, importSharedKey) : cb(null, {});
  });
};

const subscribeToChat = async (cb: Function) => {
  if (!socket) return true;

  socket.on("chat", async (messageObject: IAsymmetricMessageObject) => {
    console.log("Websocket event received!");

    let utf8decoder = new TextDecoder();

    let plainBody: any;
    try {
      /**
       * make convert imported private key into usable format
       */
      const importPrivateKey = await window.crypto.subtle.importKey(
        "jwk",
        messageObject.myPrivateKey,
        {
          name: "RSA-OAEP",
          hash: { name: "SHA-256" },
        },
        false,
        ["decrypt"]
      );

      plainBody = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        importPrivateKey,
        Buffer.from(messageObject.body)
      );

      console.log("Decrypted message: ", utf8decoder.decode(plainBody));
    } catch (error) {
      // if the key is wrong, we don't want to decrypt the message
      plainBody = undefined;
    }

    const decryptedMessageObject = {
      ...messageObject,
      body: utf8decoder.decode(plainBody),
    };

    console.log("decryptedMessageObject", decryptedMessageObject);

    return plainBody
      ? cb(null, decryptedMessageObject)
      : cb(null, messageObject); // cb(error, message)
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

  try {
    if (messageObject.type === "text") {
      encryptedMessage = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        myPublicKey,
        Buffer.from(messageObject.body)
      );
    } else {
      encryptedMessage = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        myPublicKey,
        Buffer.from(messageObject.body)
      );
    }
  } catch (error) {
    console.log("error", error);
  }

  console.log("encryptedMessage before sending", encryptedMessage);

  /**
   * make private key into exportable format
   */
  const exportedPrivateKey = await window.crypto.subtle.exportKey(
    "jwk",
    myPrivateKey
  );

  const encryptedMessageObject = {
    ...messageObject,
    body: encryptedMessage,
    myPrivateKey: exportedPrivateKey,
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
