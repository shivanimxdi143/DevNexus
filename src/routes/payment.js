
const express = require("express");
const paymentRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const Payment = require("../models/payment");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// Prices are in paise
const PLAN_PRICES = {
    monthly: 19900,
    yearly: 99900,
};

// Create Razorpay order
paymentRouter.post("/payment/create-order", userAuth, async (req, res) => {
    try {
        const { plan } = req.body;

        if (!Object.prototype.hasOwnProperty.call(PLAN_PRICES, plan)) {
            return res.status(400).json({
                message: "Invalid Premium plan",
            });
        }

        const amount = PLAN_PRICES[plan];

        const options = {
            amount,
            currency: "INR",
            receipt: `devnexus_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                plan,
            },
        };

        const order = await razorpay.orders.create(options);

        const payment = new Payment({
            userId: req.user._id,
            razorpayOrderId: order.id,
            amount,
            currency: "INR",
            plan,
            status: "created",
        });

        await payment.save();

        return res.status(201).json({
            message: "Payment order created successfully",
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan,
        });

    } catch (err) {
        console.error("Create order error:", err.message);

        return res.status(500).json({
            message: "Unable to create payment order",
        });
    }
});


// Verify Razorpay payment
paymentRouter.post("/payment/verify", userAuth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // Validate request data
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Payment details are missing",
            });
        }

        // Signature must be a 64-character hexadecimal SHA256 hash
        if (!/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
            return res.status(400).json({
                message: "Invalid payment signature",
            });
        }

        // Find order belonging to the logged-in user
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            userId: req.user._id,
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment order not found",
            });
        }

        // Prevent duplicate Premium activation
        if (payment.status === "success") {
            return res.status(200).json({
                message: "Payment already verified",
                premium: req.user.premium,
            });
        }

        if (payment.status !== "created") {
            return res.status(400).json({
                message: "Invalid payment status",
            });
        }

        // Generate expected Razorpay signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        // Compare signatures securely
        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(razorpay_signature, "hex");

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                message: "Invalid payment signature",
            });
        }

        // Fetch payment directly from Razorpay
        const razorpayPayment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        // Verify payment details
        if (
            razorpayPayment.order_id !== razorpay_order_id ||
            razorpayPayment.amount !== payment.amount ||
            razorpayPayment.currency !== payment.currency ||
            razorpayPayment.status !== "captured"
        ) {
            return res.status(400).json({
                message: "Payment is not captured or details do not match",
            });
        }

        // Calculate Premium expiry
        const now = new Date();

        const currentExpiry = req.user.premium?.expiryDate;

        const hasActivePremium =
            req.user.premium?.isActive &&
            currentExpiry &&
            new Date(currentExpiry) > now;

        const baseDate = hasActivePremium
            ? new Date(currentExpiry)
            : now;

        const startDate = hasActivePremium
            ? req.user.premium.startDate
            : now;

        const durationDays = payment.plan === "monthly" ? 30 : 365;

        const expiryDate = new Date(baseDate);
        expiryDate.setDate(expiryDate.getDate() + durationDays);

        // Activate or extend Premium
        req.user.premium = {
            isActive: true,
            plan: payment.plan,
            startDate,
            expiryDate,
        };

        await req.user.save();

        // Update payment record
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = "success";

        await payment.save();

        return res.status(200).json({
            message: "Payment verified and Premium activated successfully",
            premium: req.user.premium,
        });

    } catch (err) {
        console.error("Payment verification error:", err.message);

        return res.status(500).json({
            message: "Payment verification failed",
        });
    }
});


// Handle failed Razorpay payment
paymentRouter.post("/payment/failed", userAuth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({
                message: "Payment details are missing",
            });
        }

        // Find order belonging to the logged-in user
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            userId: req.user._id,
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment order not found",
            });
        }

       // Handle repeated failure callbacks
if (payment.status === "failed") {
    return res.status(200).json({
        message: "Payment failure already recorded",
    });
}

if (payment.status !== "created") {
    return res.status(400).json({
        message: "Payment cannot be marked as failed",
    });
}

        // Confirm failure with Razorpay
        const razorpayPayment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        if (
            razorpayPayment.order_id !== razorpay_order_id ||
            razorpayPayment.status !== "failed"
        ) {
            return res.status(400).json({
                message: "Payment failure could not be verified",
            });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = "failed";

        await payment.save();

        return res.status(200).json({
            message: "Failed payment recorded successfully",
        });

    } catch (err) {
        console.error("Payment failure error:", err.message);

        return res.status(500).json({
            message: "Unable to record failed payment",
        });
    }
});


// Get current Premium membership status
paymentRouter.get("/payment/status", userAuth, async (req, res) => {
    try {
        const premium = req.user.premium || {};

        // Check actual expiry instead of relying only on isActive
        const isActive = Boolean(
            premium.isActive &&
            premium.expiryDate &&
            new Date(premium.expiryDate) > new Date()
        );

        return res.status(200).json({
            isActive,
            plan: isActive ? premium.plan : null,
            startDate: premium.startDate || null,
            expiryDate: premium.expiryDate || null,
        });

    } catch (err) {
        console.error("Premium status error:", err.message);

        return res.status(500).json({
            message: "Unable to fetch Premium status",
        });
    }
});


module.exports = paymentRouter;
