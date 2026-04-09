import ApiError from '#entities/ApiError.js';

const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req?.session?.user?.role;

        if (!userRole) {
            return next(ApiError.unauthorized('Unauthorized: Missing role in session', {}, req.originalUrl));
        }

        if (!allowedRoles.includes(userRole)) {
            return next(ApiError.forbidden('Forbidden: Insufficient role permission', {}, req.originalUrl));
        }

        return next();
    };
};

export default roleCheck;
