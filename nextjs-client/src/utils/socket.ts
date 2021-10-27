import io, { Socket } from "socket.io-client";
import { encrypt, decrypt } from "./cryptography";

import { IMessageObject } from "../../interface";

let socket: Socket;
let key: string = "defaultKey";

const setKey = (newKey: string) => (key = newKey);

const initiateSocket = (room: string) => {
  const socketServer =
    process.env.NODE_ENV == "production"
      ? "encrypted-fileshare.ml:4000"
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

    let decryptedMessageObject = messageObject;

    let plainBody: string;
    try {
      plainBody = decrypt(messageObject.body, key);
    } catch (error) {
      plainBody = undefined;
    }

    decryptedMessageObject = { ...decryptedMessageObject, body: plainBody };

    return plainBody
      ? cb(null, decryptedMessageObject)
      : cb(null, messageObject); // cb(error, message)
  });
};

const sendMessage = (room: string, messageObject: IMessageObject) => {
  if (!socket) return true;

  let encryptedMessageObject = messageObject;

  const cipherBody = encrypt(messageObject.body, key);

  encryptedMessageObject = { ...encryptedMessageObject, body: cipherBody };

  socket.emit("chat", { messageObject: encryptedMessageObject, room });
};

export {
  setKey,
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendMessage,
};
