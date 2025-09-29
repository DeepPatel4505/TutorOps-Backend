import prisma from '@utils/prisma';
import bcrypt from 'bcryptjs';
import ApiError from '@entities/ApiError';

const findUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(401, 'Invalid email or password');
    return user;
};

const verifyUserPassword = async (user, password) => {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, 'Invalid email or password');
    return true;
};

export  {
    findUserByEmail,
    verifyUserPassword,
};
