import io, { Socket } from "socket.io-client";
import { encrypt, decrypt } from "./cryptography";

import { IMessageObject } from "../../interface";

let socket: Socket;
let key: string = "defaultKey";

const setKey = (newKey: string) => (key = newKey);

const initiateSocket = (room: string) => {
  const socketServer =
    process.env.NODE_ENV == "production"
      ? "encrypted-fileshare.ml"
      : "localhost:2000";
  socket = io(`${socketServer}`);
  console.log(`Connecting socket...`);

  if (socket && room) socket.emit("join", room);
};

const disconnectSocket = () => {
  console.log("Disconnecting socket...");

  if (socket) socket.disconnect();
};

const subscribeToChat = (cb: Function) => {
  if (!socket) return true;

  socket.on("chat", (messageObject: IMessageObject) => {
    console.log("Websocket event received!");

    let plainBody: string;
    try {
      plainBody = decrypt(messageObject.body, key);
    } catch (error) {
      // if the key is wrong, we don't want to decrypt the message
      plainBody = undefined;
    }

    const decryptedMessageObject = {
      ...messageObject,
      body: plainBody,
    };

    return plainBody
      ? cb(null, decryptedMessageObject)
      : cb(null, messageObject); // cb(error, message)
  });
};

const sendMessage = (room: string, messageObject: IMessageObject) => {
  if (!socket) return true;

  const cipherBody = encrypt(messageObject.body, key);

  const encryptedMessageObject = { ...messageObject, body: cipherBody };

  socket.emit("chat", { messageObject: encryptedMessageObject, room });
};

export {
  setKey,
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendMessage,
};
