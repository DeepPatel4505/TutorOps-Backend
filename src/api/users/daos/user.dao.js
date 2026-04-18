import prisma from '#utils/prisma.js';

export const listUsersByRoleRaw = async ({ role }) => {
    return prisma.user.findMany({
        where: role ? { role } : undefined,
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};
