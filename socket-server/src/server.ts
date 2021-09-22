import * as express from "express";
import * as socketio from "socket.io";
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

io.on("connection", (socket: any) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("disconnect", () => console.log(`Disconnected: ${socket.id}`));

  socket.on("join", (room: number) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
  });

  socket.on("chat", (data: any) => {
    const { message, room } = data;
    console.log(`msg: ${message}, room: ${room}`);
    io.to(room).emit("chat", message);
  });
});

const server = http.listen(PORT, function () {
  console.log(`listening on *:${PORT}`);
});
