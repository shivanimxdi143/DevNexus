
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
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
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
    about: {
        type: String,
        default: "This is a default about of a user",
    },
    photoUrl: {
        type: String,
        default: "",
    },
    skills: {
        type: [String],
    },

    // Premium membership details
    premium: {
        isActive: {
            type: Boolean,
            default: false,
        },
        plan: {
            type: String,
            enum: ["monthly", "yearly", null],
            default: null,
        },
        startDate: {
            type: Date,
            default: null,
        },
        expiryDate: {
            type: Date,
            default: null,
        },
    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
