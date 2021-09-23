import io, { Socket } from "socket.io-client";
import { encrypt, decrypt } from "./cryptography";

let socket: Socket;
let key: string = "defaultKey";

const setKey = (newKey: string) => (key = newKey);

const initiateSocket = (room: string) => {
  socket = io("http://localhost:2000");
  console.log(`Connecting socket...`);

  if (socket && room) socket.emit("join", room);
};

const disconnectSocket = () => {
  console.log("Disconnecting socket...");

  if (socket) socket.disconnect();
};

const subscribeToChat = (cb: Function) => {
  if (!socket) return true;

  socket.on("chat", (cipherText: string) => {
    console.log("Websocket event received!");

    const plainText = decrypt(cipherText, key);
    return plainText ? cb(null, plainText) : cb(null, cipherText); // cb(error, message)
  });
};

const sendMessage = (room: string, message: string) => {
  if (!socket) return true;

  const cipherText = encrypt(message, key);
  socket.emit("chat", { message: cipherText, room });
};

export {
  setKey,
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendMessage,
};
