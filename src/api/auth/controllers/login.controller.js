import { loginService } from '../services/login.service.js';
import ApiResponse from '#entities/ApiResponse.js';
import ApiError from '#entities/ApiError.js';
import { addSessionForUser} from '../daos/session.dao.js';

export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Run service
        const userPayload = await loginService({ email, password });
        // Prevent session fixation attack
        req.session.regenerate(async (err) => {
            if (err) return next(new ApiError(500, 'Session regeneration failed', err));
            // Store only minimal info in session
            req.session.user = {
                id: userPayload.id,
                role: userPayload.role,
            };
            const sid = req.sessionID;
            // Persist session in DB
            await addSessionForUser(userPayload.id, sid);

            return res.status(200).json(new ApiResponse({ user: userPayload }, 'Login successful'));
        });
    } catch (err) {
        next(err instanceof ApiError ? err : new ApiError(500, 'Internal server error', err));
    }
};
