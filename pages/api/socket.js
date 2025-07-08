import { Server } from "socket.io";

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket.io already initialized");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // Story generation progress events
    socket.on("story:generate:start", (data) => {
      console.log("Story generation started:", data);
      socket.emit("story:progress", { message: "Starting story generation..." });
    });

    socket.on("story:generate:progress", (data) => {
      socket.emit("story:progress", data);
    });

    socket.on("story:generate:complete", (data) => {
      socket.emit("story:complete", data);
    });

    socket.on("story:generate:error", (error) => {
      socket.emit("story:error", error);
    });
  });

  console.log("Socket.io server initialized");
  res.end();
}