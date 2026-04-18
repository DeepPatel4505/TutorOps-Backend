import ApiError from '#entities/ApiError.js';
import ApiResponse from '#entities/ApiResponse.js';
import { listUsers } from '../services/user.service.js';

export const listUsersController = async (req, res, next) => {
    try {
        const result = await listUsers({ role: req.query.role });
        return res.status(200).json(new ApiResponse(result, 'Users fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch users', err, req.originalUrl));
    }
};
