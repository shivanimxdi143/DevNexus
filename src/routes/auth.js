const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Environment-aware cookie options for cross-origin HTTPS & local development
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
};

// SIGNUP
authRouter.post("/signup", async (req, res) => {
    try {
        validateSignUpData(req);

        const {
            firstName,
            lastName,
            emailId,
            password,
            age,
            gender
        } = req.body;

        const normalizedEmail = emailId.trim().toLowerCase();

        const existingUser = await User.findOne({
            emailId: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).send("Email already registered!");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId: normalizedEmail,
            password: passwordHash,
            age,
            gender
        });

        await user.save();

        res.status(201).send("User added successfully");
    }
    catch (err) {
        res.status(400).send("Error saving the user: " + err.message);
    }
});

// LOGIN
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId });

        if (!user) {
            throw new Error("invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (isPasswordValid) {
            const token = jwt.sign(
                { _id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.cookie("token", token, {
                ...cookieOptions,
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

// LOGOUT
authRouter.post("/logout", (req, res) => {
    res.clearCookie("token", cookieOptions);
    res.send("Logout successful!");
});

module.exports = authRouter;
