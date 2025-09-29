import ApiError from '@entities/ApiError';
import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
        return next(new ApiError(401, 'Refresh token missing'));
    }
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Access token missing'));
    }
    const access_token = authHeader.split(' ')[1];
    if (!access_token) {
        return next(ApiError.unauthorized('Invalid token'));
    }
    console.log(access_token);
    
    const decodedUser = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
    console.log(decodedUser);
    
    req.user = decodedUser;
    next();
};
export default isAuthenticated;
