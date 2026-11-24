const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validation");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

// View profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user.toObject();
    delete user.password;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Edit profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid profile update");
    }

    const { firstName, lastName, age, gender, about, skills } = req.body;

    if (firstName !== undefined && (typeof firstName !== "string" || firstName.trim().length < 4)) {
      throw new Error("First name must contain at least 4 characters");
    }

    if (lastName !== undefined && typeof lastName !== "string") {
      throw new Error("Invalid last name");
    }

    if (age !== undefined && (!Number.isInteger(Number(age)) || Number(age) < 18)) {
      throw new Error("Age must be at least 18");
    }

    if (gender !== undefined && !["male", "female", "others"].includes(gender)) {
      throw new Error("Invalid gender");
    }

    if (about !== undefined && typeof about !== "string") {
      throw new Error("About must be text");
    }

    if (skills !== undefined && (!Array.isArray(skills) || !skills.every(skill => typeof skill === "string"))) {
      throw new Error("Skills must be an array of strings");
    }

    const loggedInUser = req.user;

    if (firstName !== undefined) loggedInUser.firstName = firstName.trim();
    if (lastName !== undefined) loggedInUser.lastName = lastName.trim();
    if (age !== undefined) loggedInUser.age = Number(age);
    if (gender !== undefined) loggedInUser.gender = gender;
    if (about !== undefined) loggedInUser.about = about;
    if (skills !== undefined) loggedInUser.skills = skills;

    await loggedInUser.save();

    const updatedUser = loggedInUser.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Upload profile photo
profileRouter.post(
  "/profile/upload-photo",
  userAuth,
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("Please select an image");
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "DevNexus/profile_photos",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      req.user.photoUrl = result.secure_url;
      await req.user.save();

      const updatedUser = req.user.toObject();
      delete updatedUser.password;

      res.json(updatedUser);
    } catch (err) {
      res.status(500).send("Photo upload failed: " + err.message);
    }
  }
);

module.exports = profileRouter;