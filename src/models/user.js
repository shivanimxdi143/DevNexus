const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 100,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Enter Strong password");
            }
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender data is not valid");
            }
        },
    },
    photoUrl: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_xBGMyrKD7FQfsYWztueu_LYoTMCnKQbYOfcyqGUYLFjAvSpm3k0cYUQJ&s=10",
        validate(value) {
            if(!validator.isURL(value)) {
                throw new error("Invalid url");
            }
        },
    },
    about: {
        type: String,
        default: "This is a default about of a user",
    },
    skills: {
        type: [String],
    },
},
{
  timestamps: true,
}
);

const User = mongoose.model("User", userSchema);

module.exports = User;





