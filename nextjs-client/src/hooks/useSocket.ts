import io, { Socket } from "socket.io-client";

let socket: Socket;

export const initiateSocket = (room: number) => {
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
  socket.on("chat", (msg: string) => {
    console.log("Websocket event received!");
    return cb(null, msg);
  });
};

export const sendMessage = (room: number, message: string) => {
  if (socket) socket.emit("chat", { message, room });
};
