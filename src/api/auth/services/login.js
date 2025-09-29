import ApiError from '@entities/ApiError';
import ApiResponse from '@entities/ApiResponse';
import { findUserByEmail, verifyUserPassword } from '../daos/login.dao.js';
import jwt from 'jsonwebtoken';

const login = async (req, res, next) => {
    // <-- add next
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);

        await verifyUserPassword(user, password); // throws if invalid

        delete user.password;

        const access_token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        const refresh_token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json(new ApiResponse({ access_token }, 'Login successful'));
    } catch (error) {
        next(error instanceof ApiError ? error : new ApiError(500, 'Internal server error', error));
    }
};

export default login;
