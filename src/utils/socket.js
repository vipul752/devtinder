const { Server } = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const getHashedRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

module.exports.initialiseSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://dev-tinder-web-mu.vercel.app/",
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

    socket.on("sendMessage", async ({ userId, targetUserId, message }) => {
      try {
        const roomId = getHashedRoomId(userId, targetUserId);

        const socketsInRoom = io.sockets.adapter.rooms.get(roomId);

        if (socketsInRoom && socketsInRoom.size > 1) {
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [{ senderId: userId, text: message }],
            });
          } else {
            chat.messages.push({ senderId: userId, text: message });
          }

          await chat.save();

          Array.from(socketsInRoom).forEach((socketId) => {
            if (socketId !== socket.id) {
              io.to(socketId).emit("newMessage", { userId, message });
            }
          });

          console.log(`Message from ${userId} to ${roomId}: ${message}`);
        } else {
          console.log(`Target user not connected to room ${roomId}`);
        }
      } catch (error) {
        console.error("Error while saving message:", error);
        io.to(socket.id).emit(
          "error",
          "Something went wrong, please try again."
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
