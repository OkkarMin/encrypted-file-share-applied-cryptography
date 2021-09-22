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
let io = require("socket.io")(http);
app.get("/", (req, res) => {
    res.sendFile(path.resolve("./client/index.html"));
});
// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on("connection", function (socket) {
    console.log("a user connected");
    // whenever we receive a 'message' we log it out
    socket.on("message", function (message) {
        console.log(message);
    });
});
const server = http.listen(PORT, function () {
    console.log(`listening on *:${PORT}`);
});
//# sourceMappingURL=server.js.map