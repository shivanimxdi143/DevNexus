const express = require("express");
const userRouter = express.Router();

const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");

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

module.exports = userRouter;


