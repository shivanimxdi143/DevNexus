const express = require("express");
const userRouter = express.Router();

const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

userRouter.get("/user/requests/received", userAuth, async(req,res) => {
    try {
        const loggedInUser = req.user;
       
        const connectionRequest = await ConnectionRequest.find({
            toId_receiver: loggedInUser._id,
            status: "interested"
        }).populate("fromId_sender", ["firstName", "lastName"]);

        res.json({
        message: "Pending requests fetched successfully",
        data: connectionRequest
});
    }
    catch(err) {
        res.status(400).send("ERROR: "+ err.message);
    }
});

userRouter.get("/user/connections", userAuth, async(req,res) => {
    try {
       const loggedInUser = req.user;

       const connectionRequest = await ConnectionRequest.find({
         $or: [
            {toId_receiver: loggedInUser._id, status: "accepted"},
            {fromId_sender: loggedInUser._id, status: "accepted" },
         ],
       }).populate("fromId_sender", ["firstName", "lastName"]).populate("toId_receiver", ["firstName", "lastName"]);

       const data = connectionRequest.map((connectionRequest) => {
    if(connectionRequest.fromId_sender._id.toString() === loggedInUser) {
        return connectionRequest.toId_receiver;
    }
       return connectionRequest.fromId_sender;
       
    });

     res.json({data});
    }
    catch(err) {
        res.status(400).send("ERROR: "+ err.message);
    }
})

// now in feed we will see the cards of all people except - his own card, his connection, ignored people, already sent the connection request
userRouter.get("/feed", userAuth, async(req,res) => {
    try {
       const loggedInUser = req.user;
       
       const page = parseInt(req.query.page) || 1;
       const limit = parseInt(req.query.limit) || 10;
       limit = limit>50 ? 50 : limit;
       const skip = (page-1) * limit;
       // find all connection request either sent or received
       const connectionRequests = await ConnectionRequest.find({
        $or: [
            {fromId_sender: loggedInUser},
            {toId_receiver: loggedInUser},
        ]
       }).select("fromId_sender toId_receiver");
      
       const hideUsersFromFeed = new Set();
       connectionRequests.forEach((req) => {
        hideUsersFromFeed.add(req.fromId_sender.toString());
        hideUsersFromFeed.add(req.toId_receiver.toString());
       });

       const users = await User.find({
        $and: [
       {_id: {$nin: Array.from(hideUsersFromFeed)} },
       {_id: { $ne: loggedInUser._id} },
        ],
       })
       .skip(skip)
       .limit(limit);
       res.send(users);
    }
    catch(err) {
        res.status(400).json({message: err.message});
    }
})
module.exports = userRouter;


