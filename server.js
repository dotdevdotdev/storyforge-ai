require("dotenv").config();

const express = require("express");
const next = require("next");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoErrorMiddleware = require("./middleware/mongoErrorMiddleware");
const { errorHandler } = require("./lib/errors/handler");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize error logging
const logError = (err, req = {}) => {
  console.error('Server Error:', {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: dev ? err.stack : undefined,
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
    }
  });
};

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  // Parse JSON bodies
  server.use(express.json());

  // Socket connection handling
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("error", (error) => {
      console.error("Socket Error:", error);
    });
  });

  // API routes
  server.use("/api", (req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    });
    next();
  });

  // Next.js request handling
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  // Error handling middleware
  server.use(mongoErrorMiddleware);
  server.use((err, req, res, next) => {
    logError(err, req);
    errorHandler(err, req, res, next);
  });

  const PORT = process.env.SERVER_PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) {
      logError(err);
      throw err;
    }
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch((err) => {
  logError(err);
  console.error('Failed to start server:', err);
  process.exit(1);
});
