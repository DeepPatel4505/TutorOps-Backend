import { authenticateGoogleLogin, googleLoginService } from '../services/googleAuth.service.js';
import { addSessionForUser } from '../daos/session.dao.js';
import ApiError from '#entities/ApiError.js';

export const googleCallbackController = async (req, res, next) => {
    try {
        const state = req.query.state ? JSON.parse(decodeURIComponent(req.query.state)) : {};

        if (!req.query.code) {
            return res.redirect(process.env.FRONTEND_URL);
        }

        // 1. Authenticate Google
        const googleUser = await authenticateGoogleLogin(req.query.code);

        // 2. Find or create user
        const user = await googleLoginService(googleUser);

        // 3. Create a session
        req.session.regenerate(async (err) => {
            if (err) return next(err);

            req.session.user = {
                id: user.id,
                role: user.role,
            };

            await addSessionForUser(user.id, req.sessionID);

            return res.redirect(`${process.env.FRONTEND_URL}${state.from || '/'}`);
        });
    } catch (err) {
        next(new ApiError(500, 'Google login failed', err));
    }
};
