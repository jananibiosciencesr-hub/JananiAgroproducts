import express from "express";
import {
  loginWithEmail,
  sendOtp,
  verifyOtp,
  signupCustomer,
  loginWithGoogle,
  forgotPassword,
  resetPassword,
  getMe,
  savePreferences
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login-email", loginWithEmail);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signupCustomer);
router.post("/google", loginWithGoogle);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", getMe);
router.post("/preferences", savePreferences);

export default router;
