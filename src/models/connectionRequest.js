const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        fromId_sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        toId_receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: {
               values: ["interested", "ignored", "accepted", "rejected"],
               message: `{VALUE} is incorrect status type`,
            },
        },
    },
    {
        timestamps: true
    }
);

connectionRequestSchema.index({ fromId_sender: 1, toId_receiver: 1 });

connectionRequestSchema.pre("save", function () {
    const connectionRequest = this;

    if(connectionRequest.fromId_sender.equals(connectionRequest.toId_receiver)) {
        throw new Error("cannot send connection request to yourself");
    }
    
})

const ConnectionRequestModel = mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);

module.exports = ConnectionRequestModel;