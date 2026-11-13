const express = require("express");
const authRouter = express.Router();

const  { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

authRouter.post("/signup" , async (req,res) => {
     
    try {
     validateSignUpData(req);

     const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

     const user = new User({
       firstName, lastName, emailId, password: passwordHash,
     });

     await user.save();
     res.send("User added successfully");
    }
    catch (err) {
      console.log(err);
      res.status(400).send("Error saving the user:" + err.message);
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId });

        if (!user) {
            throw new Error("invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (isPasswordValid) {
            // CREATE A JWT TOKEN

           const token = jwt.sign(
  { _id: user._id },
  "DevNexus@NewSecret2026#Secure",
  { expiresIn: "7d" }
);
          
           
           res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires: new Date(Date.now() + 8 * 3600000),
});

            res.send("Login Successful!");
        } else {
            throw new Error("Password not correct");
        }

    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});


authRouter.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
    });

    res.send("Logout successful!");
});




module.exports = authRouter;