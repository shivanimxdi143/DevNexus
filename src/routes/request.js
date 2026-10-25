const express = require("express");
const requestRouter = express.Router();

const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


requestRouter.post("/request/send/:status/:toId_receiver", userAuth, async(req, res) => {

   try {
    const fromId_sender = req.user._id;
    const toId_receiver = req.params.toId_receiver;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];
    if(!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status type: " + status });
    }



    const toUser = await User.findById(toId_receiver);
    if(!toUser) {
      return res.status(400).json({
        message: "User not found"
      });
    }
  
    const existingConnectionRequest = await ConnectionRequest.findOne({
    $or: [
        { fromId_sender, toId_receiver },
        {
            fromId_sender: toId_receiver,
            toId_receiver: fromId_sender
        }
    ]
});

    if (existingConnectionRequest) {
    return res.status(400).json({
        message: "Connection request already exists"
    });
}

    const connectionRequest = new ConnectionRequest({
      fromId_sender, toId_receiver, status
    });

    const data = await connectionRequest.save();

    res.json({
     message: req.user.firstName + " is " + status + " in " + toUser.firstName,
    data,
    });
   }
   catch(err) {
    res.status(400).send("ERROR: "+ err.message);
   }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async(req,res) => {
   try{
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if(!allowedStatus.includes(status)) {
      return res.status(400).json({message: "status not allowed!"});
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toId_receiver: loggedInUser._id,
      status: "interested",
    });

    if(!connectionRequest) {
      return res.status(404).json({message: "connection request not found"});
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();
    return res.json({
    message: "Connection request " + status,
    data
});
   }
   catch(err) {
    res.status(400).send("ERROR: " + err.message);
   }
})

module.exports = requestRouter;

