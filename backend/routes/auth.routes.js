import express from 'express';
import { loginUser, registerUser, verifyOtpAndRegister } from '../controllers/auth.controller.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'),registerUser);
router.post('/verify', verifyOtpAndRegister); // Verifies OTP + saves user
router.post('/login', loginUser);   

export default router;
