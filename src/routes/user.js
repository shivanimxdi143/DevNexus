
const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

// Get received connection requests
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const connectionRequest = await ConnectionRequest.find({
            toId_receiver: req.user._id,
            status: "interested",
        }).populate(
            "fromId_sender",
            "firstName lastName age gender about skills photoUrl"
        );

        return res.status(200).json({
            message: "Pending requests fetched successfully",
            data: connectionRequest,
        });
    } catch (err) {
        return res.status(400).json({
            message: err.message,
        });
    }
});

// Get accepted connections
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromId_sender: req.user._id, status: "accepted" },
                { toId_receiver: req.user._id, status: "accepted" },
            ],
        })
            .populate(
                "fromId_sender",
                "firstName lastName age gender about skills photoUrl"
            )
            .populate(
                "toId_receiver",
                "firstName lastName age gender about skills photoUrl"
            );

        const connections = connectionRequests.map((request) => {
            const user =
                request.fromId_sender._id.toString() ===
                req.user._id.toString()
                    ? request.toId_receiver
                    : request.fromId_sender;

            return {
                connectionId: request._id,
                user,
            };
        });

        return res.status(200).json({
            data: connections,
        });
    } catch (err) {
        return res.status(400).json({
            message: err.message,
        });
    }
});

// Get developer feed
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        let limit = parseInt(req.query.limit) || 10;

        limit = Math.min(Math.max(limit, 1), 50);

        const skip = (page - 1) * limit;

        // Find users who already have a connection request
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromId_sender: loggedInUser._id },
                { toId_receiver: loggedInUser._id },
            ],
        }).select("fromId_sender toId_receiver");

        // Exclude both users involved in existing requests
        const hideUsersFromFeed = new Set();

        connectionRequests.forEach((request) => {
            hideUsersFromFeed.add(request.fromId_sender.toString());
            hideUsersFromFeed.add(request.toId_receiver.toString());
        });

        // Fetch remaining developers with Premium fields
        const users = await User.find({
            _id: {
                $nin: [
                    ...Array.from(hideUsersFromFeed),
                    loggedInUser._id,
                ],
            },
        })
            .select(
                "firstName lastName age gender about skills photoUrl premium.isActive premium.expiryDate"
            )
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate actual Premium status
        const now = new Date();

        const feedUsers = users.map((user) => {
            const isPremium = Boolean(
                user.premium?.isActive &&
                user.premium?.expiryDate &&
                new Date(user.premium.expiryDate) > now
            );

            const { premium, ...publicUser } = user;

            return {
                ...publicUser,
                isPremium,
            };
        });

        return res.status(200).json(feedUsers);
    } catch (err) {
        console.error("Feed Error:", err);

        return res.status(500).json({
            message: "Something went wrong while fetching the feed.",
        });
    }
});

module.exports = userRouter;
