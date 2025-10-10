import zodValidator from "@middlewares/zodValidator";
import { Router } from "express";
import { loginDto } from "./dtos/login.dto";
import login from "./services/login";
import { registerDto } from "./dtos/register.dto";
import register from "./services/register";
import { getMe } from "./services/getMe";
import  isAuthenticated  from "@middlewares/isAuthenticated";
import { googleCallback } from "./services/googleAuth";
import { refresh } from "./services/refresh"
import { logout } from "./services/logout";

const router = Router();

router.get("/me", isAuthenticated, getMe);
router.get("/refresh", isAuthenticated, refresh);

router.post("/login", zodValidator(loginDto), login);
router.post("/register", zodValidator(registerDto), register);
router.post("/google-callback", googleCallback );
router.post("/logout", isAuthenticated, logout);



export { router };