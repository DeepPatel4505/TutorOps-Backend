import prisma from '#utils/prisma.js';

export const createClass = async ({ name, teacherId }) => {
    return prisma.class.create({
        data: {
            name,
            teacherId,
        },
    });
};

export const getTeacherClasses = async ({ teacherId }) => {
    return prisma.class.findMany({
        where: { teacherId },
        include: {
            enrollments: {
                select: { id: true },
            },
            assignments: {
                select: { id: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const findClassByIdAndTeacher = async ({ classId, teacherId }) => {
    return prisma.class.findFirst({
        where: {
            id: classId,
            teacherId,
        },
    });
};

export const findUserById = async ({ userId }) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
};

export const findEnrollment = async ({ classId, studentId }) => {
    return prisma.enrollment.findFirst({
        where: {
            classId,
            studentId,
        },
    });
};

export const createEnrollment = async ({ classId, studentId }) => {
    return prisma.enrollment.create({
        data: {
            classId,
            studentId,
        },
    });
};

export const getClassStudents = async ({ classId, teacherId }) => {
    return prisma.class.findFirst({
        where: {
            id: classId,
            teacherId,
        },
        include: {
            enrollments: {
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    joinedAt: 'asc',
                },
            },
        },
    });
};
