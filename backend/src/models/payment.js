
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
        },

        razorpayPaymentId: {
            type: String,
            default: null,
        },

        razorpaySignature: {
            type: String,
            default: null,
        },

        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "INR",
        },

        plan: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true,
        },

        status: {
            type: String,
            enum: ["created", "success", "failed"],
            default: "created",
        },
    },
    { timestamps: true }
);

// Ensure actual Razorpay payment IDs are unique
paymentSchema.index(
    { razorpayPaymentId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            razorpayPaymentId: { $type: "string" },
        },
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
