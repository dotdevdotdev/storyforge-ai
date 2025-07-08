import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      await fetch("/api/socket");
      
      socket = io();

      socket.on("connect", () => {
        console.log("Connected to socket server");
        setConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
        setConnected(false);
      });
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return { socket, connected };
};