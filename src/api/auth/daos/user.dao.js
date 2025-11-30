import prisma from '#src/utils/prisma.js';
import bcrypt from 'bcryptjs';

// find user by email for login , registration, and OAuth
export const findUserByEmail = async (email) => {
    return prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
};

// create new user for registration
export const createUser = async (tx, { email, password, username, role }) => {
    return tx.user.create({
        data: {
            email: email.toLowerCase(),
            password,
            username,
            name: username,
            role,
        },
    });
};

// verify user password for login
export const verifyUserPassword = async (user, password) => {
    if (!user?.password) return false;
    return bcrypt.compare(password, user.password);
};

// create new user for Google OAuth
export const createGoogleUser = async (googleUser) => {
    return prisma.user.create({
        data: {
            email: googleUser.email.toLowerCase(),
            name: googleUser.name,
            googleId: googleUser.googleId,
            password: null,
            role: 'STUDENT', // or whatever default
        },
    });
};

export const findUserById = async (id) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            role: true,
        },
    });
};
