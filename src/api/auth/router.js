// src/api/auth/router.js
import express from "express";
const router = express.Router();

import { registerController } from "./controllers/register.controller.js";
import { loginController } from "./controllers/login.controller.js";
import { logoutController,logoutAllDevicesController } from "./controllers/logout.controller.js";
import { getMeController } from "./controllers/getme.controller.js";
import { googleCallbackController } from "./controllers/googleCallback.controller.js";
import isAuthenticated from "#src/middlewares/isAuthenticated.js";
import { sendOtpController,verifyOtpController } from "./controllers/otp.controller.js";

router.post("/register", registerController); // User Registration and Email Verification
router.post("/sendOtp", sendOtpController); // Resend OTP for Email Verification
router.post("/verifyOtp", verifyOtpController); // Verify OTP for Email Verification

router.post("/login", loginController); // User Login
router.post("/logout", logoutController); // User Logout
router.post("/logoutAllDevices", isAuthenticated, logoutAllDevicesController); // Logout from All Devices
router.post("/googleCallback", googleCallbackController ) // Google OAuth Callback
router.get("/me",isAuthenticated, getMeController); // Get Authenticated User Info

export { router };