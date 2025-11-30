import ApiError from '#entities/ApiError.js';
import prisma from '#src/utils/prisma.js';
import ApiResponse from '#entities/ApiResponse.js';

const isAuthenticated = async (req, res, next) => {
    try {
        const session = req.session;
        if (!session || !session.user || !session.user.id) {
            return next(new ApiError(401, 'Unauthorized : Not logged in'));
        }
        next();
    } catch (err) {
        next(new ApiError(500, 'Internal server error', err));
    }
};

export default isAuthenticated;
