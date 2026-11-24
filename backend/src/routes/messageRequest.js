
const express = require("express");
const mongoose = require("mongoose");
const messageRequestRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const MessageRequest = require("../models/messageRequest");
const Conversation = require("../models/conversation");

const COOLDOWN_HOURS = 24;
const Message = require("../models/message");


// Send message request or create conversation for accepted connections
messageRequestRouter.post("/message/request/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUser = req.user._id;
        const { toUserId } = req.params;
        const { message } = req.body;

        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (fromUser.toString() === toUserId) {
            return res.status(400).json({ message: "Cannot message yourself" });
        }

        if (!message || !message.trim() || message.length > 1000) {
            return res.status(400).json({
                message: "Message is required and must be under 1000 characters"
            });
        }

        const receiver = await User.findById(toUserId);

        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check whether a conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [fromUser, toUserId], $size: 2 }
        });

        if (conversation) {
            return res.status(200).json({
                message: "Conversation already exists",
                conversation
            });
        }

        // Check whether users are accepted connections
        const isConnected = await ConnectionRequest.findOne({
            status: "accepted",
            $or: [
                { fromId_sender: fromUser, toId_receiver: toUserId },
                { fromId_sender: toUserId, toId_receiver: fromUser }
            ]
        });

        // Free users can directly start conversations with accepted connections
        if (isConnected) {
            conversation = await Conversation.create({
                participants: [fromUser, toUserId],
                createdBy: fromUser
            });

            return res.status(201).json({
                message: "Conversation created successfully",
                conversation
            });
        }

        // Premium users can request conversations with other developers
        const sender = await User.findById(fromUser);

        const isPremiumActive =
            sender.premium?.isActive &&
            sender.premium?.expiryDate &&
            new Date(sender.premium.expiryDate) > new Date();

        if (!isPremiumActive) {
            return res.status(403).json({
                message: "Premium membership required to message non-connections"
            });
        }

        // Check previous requests between these users
        const previousRequest = await MessageRequest.findOne({
            fromUser,
            toUser: toUserId
        }).sort({ createdAt: -1 });

        if (previousRequest?.status === "pending") {
            return res.status(400).json({
                message: "You already have a pending request"
            });
        }

        if (
            previousRequest?.status === "rejected" &&
            previousRequest.cooldownUntil &&
            previousRequest.cooldownUntil > new Date()
        ) {
            return res.status(400).json({
                message: "You cannot resend a request yet",
                cooldownUntil: previousRequest.cooldownUntil
            });
        }

        const newRequest = await MessageRequest.create({
            fromUser,
            toUser: toUserId,
            message: message.trim()
        });

        return res.status(201).json({
            message: "Message request sent successfully",
            data: newRequest
        });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

// Get received message requests
messageRequestRouter.get("/message/requests/received", userAuth, async (req, res) => {
    try {
        const requests = await MessageRequest.find({
            toUser: req.user._id,
            status: "pending"
        })
        .populate("fromUser", "firstName lastName photoUrl about skills")
        .sort({ createdAt: -1 });

        res.json({ data: requests });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Accept message request and create conversation

messageRequestRouter.patch("/message/request/:requestId/accept", userAuth, async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: "Invalid request ID" });
        }

        const request = await MessageRequest.findOne({
            _id: requestId,
            toUser: req.user._id,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                message: "Pending message request not found"
            });
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [request.fromUser, request.toUser],
                $size: 2
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [request.fromUser, request.toUser],
                createdBy: request.fromUser
            });
        }

        // Save the introductory message as the first chat message
        const firstMessage = await Message.create({
            conversationId: conversation._id,
            senderId: request.fromUser,
            text: request.message
        });

        // Update the conversation's latest message
        conversation.lastMessage = firstMessage._id;
        await conversation.save();

        // Mark the request as accepted
        request.status = "accepted";
        request.cooldownUntil = null;
        await request.save();

        return res.json({
            message: "Message request accepted",
            conversation,
            firstMessage
        });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

// Reject message request
messageRequestRouter.patch("/message/request/:requestId/reject", userAuth, async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: "Invalid request ID" });
        }

        const request = await MessageRequest.findOne({
            _id: requestId,
            toUser: req.user._id,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                message: "Pending message request not found"
            });
        }

        request.status = "rejected";
        request.cooldownUntil = new Date(
            Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000
        );

        await request.save();

        return res.json({
            message: "Message request rejected",
            cooldownUntil: request.cooldownUntil
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = messageRequestRouter;
