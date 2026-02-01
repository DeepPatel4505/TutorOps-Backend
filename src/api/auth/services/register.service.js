// src/api/auth/services/register.service.js

import bcrypt from 'bcryptjs';
import ApiError from '#entities/ApiError.js';
import { findUserByEmail, createUser } from '../daos/user.dao.js';
import { ROLE } from '#utils/constant.js';
import prisma from '#src/utils/prisma.js';

export const registerService = async ({ email, password, username, role }) => {
    // 1. Check if email exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw ApiError.badRequest('Email already exists', {}, '/auth/register');
    }
    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // 3. Create user
    const newUser = await createUser(prisma, {
        email,
        password: hashedPassword,
        username,
        role: ROLE[role],
    });

    // 4. Return minimal user info
    return {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email,
        username: newUser.username,
    };
};
