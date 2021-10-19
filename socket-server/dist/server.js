"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
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
app.get("/", (req, res) => {
    res.sendFile(path.resolve("./client/index.html"));
});
io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);
    socket.on("disconnect", () => console.log(`Disconnected: ${socket.id}`));
    socket.on("join", (room) => {
        console.log(`Socket ${socket.id} joining ${room}`);
        socket.join(room);
    });
    socket.on("chat", (data) => {
        const { messageObject, room } = data;
        console.log(`msg: ${messageObject}, room: ${room}`);
        io.to(room).emit("chat", messageObject);
    });
});
const server = http.listen(PORT, function () {
    console.log(`listening on *:${PORT}`);
});
//# sourceMappingURL=server.js.map