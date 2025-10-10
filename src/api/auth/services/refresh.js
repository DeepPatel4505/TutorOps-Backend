import jwt from 'jsonwebtoken';
import ApiError from '@entities/ApiError';
import ApiResponse from '@entities/ApiResponse';

const refresh = (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) {
            return next(new ApiError(401, 'No refresh token provided'));
        }

        // Verify refresh token
        jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return next(new ApiError(403, 'Invalid or expired refresh token'));
            }

            // Generate new access token
            const new_access_token = jwt.sign(
                { id: decoded.id, role: decoded.role },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: '15m' }
            );

            return res.json(
                new ApiResponse({ access_token: new_access_token }, 'Access token refreshed')
            );
        });
    } catch (error) {
        next(new ApiError(500, 'Internal server error', error));
    }
};

export {refresh};
