// src/api/auth/router.js
import express from "express";
const router = express.Router();

import { registerController } from "./controllers/register.controller.js";
import { loginController } from "./controllers/login.controller.js";
import { logoutController,logoutAllDevicesController } from "./controllers/logout.controller.js";
import { getMeController } from "./controllers/getme.controller.js";
import { googleCallbackController } from "./controllers/googleCallback.controller.js";
import isAuthenticated from "#src/middlewares/isAuthenticated.js";

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/logoutAllDevices", isAuthenticated, logoutAllDevicesController);
router.post("/googleCallback", googleCallbackController )
router.get("/me",isAuthenticated, getMeController);

export { router };