import { registerService } from "../services/register.service.js";
import ApiError from "#entities/ApiError.js";
import ApiResponse from "#entities/ApiResponse.js";

export const registerController = async (req, res, next) => {
    try {
        const { email, password, username, role } = req.body;
        // Service creates user
        const userData = await registerService({ email, password, username, role });
        // Create session after email verification
        return res.status(201).json(ApiResponse.success("User registered successfully. Please verify your email before logging in.", userData));
    } catch (err) {
        next(err instanceof ApiError ? err : ApiError.internal(err.message, err));
    }
};
