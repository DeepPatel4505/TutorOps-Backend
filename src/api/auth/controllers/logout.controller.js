import { logoutService, logoutAllDevicesService} from '../services/logout.service.js';
import ApiResponse from '#entities/ApiResponse.js';
import ApiError from '#entities/ApiError.js';

export const logoutController = async (req, res, next) => {
    try {
        const userId = req.session?.user?.id;
        const sessionId = req.sessionID;

        // Run service logic
        if (userId && sessionId) {
            await logoutService(userId, sessionId);
        }

        req.session.destroy((err) => {
            if (err) return next(ApiError.internal('Failed to destroy session', err));

            res.clearCookie('tutorops_session', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            return res.status(200).json(new ApiResponse(null, 'Logged out successfully'));
        });
    } catch (err) {
        next(ApiError.internal('Internal server error', err));
    }
};

export const logoutAllDevicesController = async (req, res, next) => {
    try {
        // session user id is guaranteed by isAuthenticated middleware
        const userId = req.session.user.id;
        await logoutAllDevicesService(userId);

        // Destroy current session too
        req.session.destroy(() => {
            res.clearCookie('tutorops_session', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            return res
                .status(200)
                .json(new ApiResponse(null, 'Logged out from all devices successfully'));
        });
    } catch (err) {
        next(ApiError.internal());
    }
};
