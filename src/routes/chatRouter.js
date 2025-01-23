const express = require("express");
const authenticateUser = require("../middleware/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", authenticateUser, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate(
      {
        path:"messages.senderId",
        select: " firstName  lastName",
      }
    );

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
    }

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error("Error while fetching chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = chatRouter;
