
const express = require("express");
const mongoose = require("mongoose");

const conversationRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

// Get all conversations of the logged-in user
conversationRouter.get("/conversations", userAuth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate("participants", "firstName lastName photoUrl")
        .populate({
            path: "lastMessage",
            select: "text senderId createdAt"
        })
        .sort({ updatedAt: -1 });

        return res.json({ data: conversations });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get messages of a particular conversation
conversationRouter.get(
    "/conversations/:conversationId/messages",
    userAuth,
    async (req, res) => {
        try {
            const { conversationId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({ message: "Invalid conversation ID" });
            }

            // Ensure the logged-in user is a participant
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: req.user._id
            });

            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }

            const messages = await Message.find({ conversationId })
                .populate("senderId", "firstName lastName photoUrl")
                .sort({ createdAt: 1 });

            return res.json({ data: messages });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
);

module.exports = conversationRouter;
