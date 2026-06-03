"use strict";
import { Server } from "socket.io";

let io;

export function initSocketServer(server) {
    if (io) return io;

    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket conectado: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`Socket desconectado: ${socket.id}`);
        });
    });

    return io;
}

export function getSocketServer() {
    if (!io) {
        throw new Error("Socket server no inicializado. Llama a initSocketServer(server) primero.");
    }
    return io;
}
