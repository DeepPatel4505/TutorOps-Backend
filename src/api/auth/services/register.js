import ApiResponse from '@entities/ApiResponse';
import ApiError from '@entities/ApiError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ROLE } from '@utils/constant';
import { findUserByEmail, createUser } from '../daos/register.dao.js';
import prisma from '@utils/prisma.js';
import { createRefreshToken } from '../daos/token.dao.js';
import crypto from 'crypto';

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
        let refresh_token;

        // Using Prisma transaction to ensure atomicity
        await prisma.$transaction(
            async (tx) => {
                // 1. Create the user
                newUser = await createUser(tx, {
                    email,
                    password: hashedPassword,
                    username,
                    role: ROLE[role],
                });
                // 2. Generate refresh tokens
                refresh_token = jwt.sign(
                    { id: newUser.id, role: newUser.role },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: '7d' }
                );

                // 3. Hash the token and store it in the database
                const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');

                await createRefreshToken(tx, {
                    userId: newUser.id,
                    tokenHash,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    deviceName: req.headers['device-name'],
                    deviceType: req.headers['device-type'],
                });
            },
            { timeout: 10000 }
        );

        //Generate access token
        const access_token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        //set refresh token in httpOnly cookie
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        delete newUser.password;

        return res.status(201).json(new ApiResponse({ access_token }, 'Registration successful'));
    } catch (err) {
        next(new ApiError(400, err.message, err, '/auth/register'));
    }
};

export default register;
