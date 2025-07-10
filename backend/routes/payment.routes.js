import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { isHost } from "../middlewares/isHost.js";

import { createSubPaymentOrder,verifySubscriptionPayment } from "../controllers/subpayment.controller.js";


const router = express.Router();

//  Razorpay order
router.post("/create-order", protect, createOrder);

// Verify payment and save booking
router.post("/verify", protect, verifyPayment);



//for the subscription
router.post("/sub-payment/order", protect, isHost, createSubPaymentOrder);
router.post("/verify-subscription", protect, isHost, verifySubscriptionPayment);


export default router;
