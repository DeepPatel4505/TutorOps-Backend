import { registerService } from "../services/register.service.js";
import ApiError from "#entities/ApiError.js";
import ApiResponse from "#entities/ApiResponse.js";
import { addSessionForUser } from "../daos/session.dao.js";

export const registerController = async (req, res, next) => {
    try {
        console.log("RegisterController Invoked");
        const { email, password, username, role } = req.body;
        console.log("RegisterController Invoked with:", req.body);
        // Service creates user
        const userData = await registerService({ email, password, username, role });
        console.log("User registered:", userData);
        // Regenerate session to prevent fixation
        req.session.regenerate(async (err) => {
            if (err) return next(ApiError.internal("Session creation failed", err));

            // Store minimal user info
            req.session.user = {
                id: userData.id,
                role: userData.role,
            };

            const sid = req.sessionID;
            // Persist session in DB
            await addSessionForUser(userData.id, sid);
            console.log("Session created with ID:", sid);
            return res
                .status(201)
                .json(new ApiResponse({ userData }, "Registration successful"));
        });
    } catch (err) {
        console.error("Error in RegisterController:", err);
        next(err instanceof ApiError ? err : ApiError.internal(err.message, err));
    }
};
