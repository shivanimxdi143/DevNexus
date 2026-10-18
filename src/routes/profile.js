const  express = require("express");
const profileRouter = express.Router();

const {userAuth} = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validation");


profileRouter.get("/profile/view", userAuth, async(req, res) => {
try {
  const user = req.user;

  res.send(user);
}
 catch(err) {
    res.status(400).send("ERROR : " + err.message);
}
})

profileRouter.patch("/profile/edit", userAuth, async(req,res) => {
   try {
     if(!validateEditProfileData(req)) {
      throw new Error("Invalid Profile");
     }
     const loggedInUser = req.user;

     Object.keys(req.body).forEachkey((key) => (loggedInUser[key] = req.body[key]));

     await loggedInUser.save();

   }
   catch(err) {
      res.status(400).send("ERROR: " + err.message);
   }
})

module.exports = profileRouter;