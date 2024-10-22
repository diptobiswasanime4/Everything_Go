import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = http.createServer();
const wss = new WebSocketServer({ server });

const PORT = 3000;

wss.on("connection", (ws) => {
  console.log(ws);
  ws.on("message", (message) => {
    console.log(message);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
