"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
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
let listOfUsers = {
    1: {},
    2: {},
    3: {},
};
io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`Disconnected: ${socket.id}`);
        // remove user from list
        for (let room in listOfUsers) {
            for (const [key, value] of Object.entries(listOfUsers[room])) {
                if (key === socket.id) {
                    delete listOfUsers[room][key];
                    console.log(`Removed user ${socket.id} from room ${room}`);
                }
            }
        }
        io.emit("listOfUsers", listOfUsers);
    });
    socket.on("join", (data) => {
        const { exportedPublicKey, room, exportedPublicVerifyingKey, email } = data;
        console.log(`Socket ${socket.id} joining ${room}`);
        socket.join(room);
        // add user to list
        listOfUsers[room][socket.id] = {
            userEmail: email,
            exportedPublicKey: exportedPublicKey,
            exportedPublicVerifyingKey: exportedPublicVerifyingKey,
        };
        io.to(room).emit("listOfUsers", listOfUsers);
    });
    socket.on("chat", (data) => {
        const { messageObject, room } = data;
        console.log(`msg: ${messageObject}, room: ${room}`);
        io.to(room).emit("chat", messageObject);
    });
    // socket to send shared key to receipient
    socket.on("sendSharedKey", (data) => {
        const { sendToTarget, encryptedSharedKey, signature, room } = data;
        io.to(sendToTarget).emit("recieveSharedKey", data);
    });
});
const server = http.listen(PORT, function () {
    console.log(`listening on *:${PORT}`);
});
//# sourceMappingURL=server.js.map
//# sourceMappingURL=server.js.map