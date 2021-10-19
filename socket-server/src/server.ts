import * as express from "express";
import { Socket } from "socket.io";
import * as path from "path";

const PORT = process.env.PORT || 2000;

const app = express();
app.set("port", PORT);

let http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
let io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req: any, res: any) => {
  res.sendFile(path.resolve("./client/index.html"));
});

io.on("connection", (socket: Socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("disconnect", () => console.log(`Disconnected: ${socket.id}`));

  socket.on("join", (room: string) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
  });

  socket.on("chat", (data: any) => {
    const { messageObject, room } = data;
    console.log(`msg: ${messageObject}, room: ${room}`);
    io.to(room).emit("chat", messageObject);
  });
});

const server = http.listen(PORT, function () {
  console.log(`listening on *:${PORT}`);
});
