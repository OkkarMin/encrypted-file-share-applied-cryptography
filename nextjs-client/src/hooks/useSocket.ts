import io, { Socket } from "socket.io-client";
import { encrypt, decrypt } from "../utils/cryptography";

let socket: Socket;

export const initiateSocket = (room: string) => {
  socket = io("http://localhost:2000");
  console.log(`Connecting socket...`);
  if (socket && room) socket.emit("join", room);
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  if (socket) socket.disconnect();
};

export const subscribeToChat = (cb: Function) => {
  if (!socket) return true;

  socket.on("chat", (message: string) => {
    console.log("Websocket event received!");
    const plainText = decrypt(message, "hardCodedKey");

    return cb(null, plainText); // cb(error, message)
  });
};

export const sendMessage = (room: string, message: string) => {
  if (!socket) return true;

  const cipherText = encrypt(message, "hardCodedKey");
  socket.emit("chat", { message: cipherText, room });
};
