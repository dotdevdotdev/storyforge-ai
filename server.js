const express = require("express");
const next = require("next");
const { createServer } = require("http");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");
    // Add socket event handlers here
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.SERVER_PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
