
const mongoose = require("mongoose");

const messageRequestSchema = new mongoose.Schema(
    {
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },

        cooldownUntil: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

messageRequestSchema.index({ fromUser: 1, toUser: 1 });

const MessageRequest = mongoose.model(
    "MessageRequest",
    messageRequestSchema
);

module.exports = MessageRequest;
