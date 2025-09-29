import ApiResponse from '@entities/ApiResponse';
import ApiError from '@entities/ApiError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ROLE } from '@utils/constant';
import { findUserByEmail, createUser } from '../daos/register.dao.js';


const register = async (req, res, next) => {
    try {
        const { email, password, username, role } = req.body;
        const user = await findUserByEmail(email);
        if (user) {
            return next(new ApiError(400, 'Email already exists', {}, '/auth/register'));
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser;
        
        try {
            newUser = await createUser({
                email,
                password: hashedPassword,
                username,
                role: ROLE[role],
            });
            const access_token = jwt.sign(
                { id: newUser.id, role: newUser.role },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: '15m' }
            );
            const refresh_token = jwt.sign(
                { id: newUser.id, role: newUser.role },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            delete newUser.password;
            return res
                .status(201)
                .json(new ApiResponse({ access_token }, 'User created successfully'));
        } catch (transactionError) {
            return next(
                new ApiError(400, transactionError.message, transactionError, '/auth/register')
            );
        }
    } catch (err) {
        next(new ApiError(400, err.message, err, '/auth/register'));
    }
};

export default register;
