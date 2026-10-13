const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req,res,next) => {
   // Read the token from the req cookie 
   
   // validate the token
   // find the user

   try {
    const cookies = req.cookies;

   const { token } = cookies;
   if(!token) {
    throw new Error("Tokenn nottt valid!!!!!!!!!");
   }

   const decodedDate = jwt.verify(token, "DEV@NEXUS$0107");

   const { _id } = decodedDate;

   const user = await User.findById(_id);
   if(!user) {
    throw new Error("User not found");
   }

   req.user = user;
   next();
  }

  catch(err) {
    res.status(400).send("ERROR: " + err.message);
  }

};

module.exports = {
    userAuth
}
