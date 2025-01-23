const { Server } = require("socket.io");
const crypto = require("crypto");

const getHashedRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};
module.exports.initialiseSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getHashedRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on("sendMessage", ({ userId, targetUserId, message }) => {
      const roomId = getHashedRoomId(userId, targetUserId);

      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);

      if (socketsInRoom && socketsInRoom.size > 1) {
        socketsInRoom.forEach((socketId) => {
          if (socketId !== socket.id) {
            io.to(socketId).emit("newMessage", { userId, message });
          }
        });

        console.log(`Message from ${userId} to ${roomId}: ${message}`);
      } else {
        console.log(`Target user not connected to room ${roomId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
