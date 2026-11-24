
const mongoose = require("mongoose");

const Conversation = require("../models/conversation");
const Message = require("../models/message");

const chatHandler = (io, socket) => {
    const userId = socket.userId;

    // Join this user's personal room
    socket.join(`user:${userId}`);

    // Send a real-time message
    socket.on("sendMessage", async (data, callback) => {
        try {
            const { conversationId, text } = data || {};

            if (!mongoose.Types.ObjectId.isValid(conversationId)) {
                return callback?.({ success: false, message: "Invalid conversation ID" });
            }

            if (typeof text !== "string" || !text.trim() || text.trim().length > 5000) {
                return callback?.({ success: false, message: "Invalid message" });
            }

            // Verify that sender belongs to this conversation
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: userId
            });

            if (!conversation) {
                return callback?.({ success: false, message: "Conversation not found or access denied" });
            }

            // Save message in MongoDB
            const message = await Message.create({
                conversationId,
                senderId: userId,
                text: text.trim()
            });

            // Update latest message
            conversation.lastMessage = message._id;
            await conversation.save();

            const messageData = message.toObject();

            // Deliver to both participants' connected devices
            for (const participantId of conversation.participants) {
                io.to(`user:${participantId.toString()}`).emit(
                    "newMessage",
                    messageData
                );
            }

            callback?.({
                success: true,
                data: messageData
            });

        } catch (error) {
            console.error("Send message error:", error.message);
            callback?.({
                success: false,
                message: "Failed to send message"
            });
        }
    });
};

module.exports = chatHandler;
