import prisma from '#utils/prisma.js';

export const findClassByTeacher = async ({ classId, teacherId }) => {
    return prisma.class.findFirst({
        where: {
            id: classId,
            teacherId,
        },
    });
};

export const findClassEnrollment = async ({ classId, studentId }) => {
    return prisma.enrollment.findFirst({
        where: {
            classId,
            studentId,
        },
    });
};

export const getStudentAssignmentsRaw = async ({ studentId }) => {
    return prisma.assignment.findMany({
        where: {
            class: {
                enrollments: {
                    some: { studentId },
                },
            },
        },
        include: {
            class: {
                select: {
                    id: true,
                    name: true,
                },
            },
            problems: {
                select: {
                    id: true,
                },
            },
            reports: {
                where: { studentId },
                select: {
                    id: true,
                    data: true,
                    updatedAt: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const getStudentAssignmentDetailsRaw = async ({ assignmentId, studentId }) => {
    return prisma.assignment.findFirst({
        where: {
            id: assignmentId,
            class: {
                enrollments: {
                    some: { studentId },
                },
            },
        },
        include: {
            class: {
                select: {
                    id: true,
                    name: true,
                },
            },
            problems: {
                include: {
                    problem: {
                        select: {
                            id: true,
                            topic: true,
                            difficulty: true,
                            templateCode: true,
                        },
                    },
                },
            },
            reports: {
                where: {
                    studentId,
                },
                select: {
                    id: true,
                    data: true,
                    updatedAt: true,
                },
            },
        },
    });
};

export const findReportByAssignmentAndStudent = async ({ assignmentId, studentId }) => {
    return prisma.report.findFirst({
        where: {
            assignmentId,
            studentId,
        },
    });
};

export const createReport = async ({ assignmentId, studentId, data }) => {
    return prisma.report.create({
        data: {
            assignmentId,
            studentId,
            data,
        },
    });
};

export const updateReport = async ({ reportId, data }) => {
    return prisma.report.update({
        where: {
            id: reportId,
        },
        data: {
            data,
        },
    });
};

export const findAttemptByProblemAndStudent = async ({ problemInstanceId, studentId }) => {
    return prisma.attempt.findFirst({
        where: {
            problemInstanceId,
            studentId,
        },
    });
};

export const createAttempt = async ({ problemInstanceId, studentId, response, autoScore, finalScore, teacherComment }) => {
    return prisma.attempt.create({
        data: {
            problemInstanceId,
            studentId,
            response,
            autoScore,
            finalScore,
            teacherComment,
            submittedAt: new Date(),
        },
    });
};

export const updateAttempt = async ({ attemptId, response, autoScore, finalScore, teacherComment }) => {
    return prisma.attempt.update({
        where: {
            id: attemptId,
        },
        data: {
            response,
            autoScore,
            finalScore,
            teacherComment,
            submittedAt: new Date(),
        },
    });
};

export const getStudentAttemptsForAssignment = async ({ assignmentId, studentId }) => {
    return prisma.attempt.findMany({
        where: {
            studentId,
            problemInstance: {
                assignmentId,
            },
        },
        include: {
            problemInstance: {
                include: {
                    problem: {
                        select: {
                            id: true,
                            topic: true,
                            difficulty: true,
                            templateCode: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            submittedAt: 'asc',
        },
    });
};

export const createAssignmentWithProblems = async ({ classId, title, description, dueDate, problems }) => {
    return prisma.$transaction(async (tx) => {
        const assignment = await tx.assignment.create({
            data: {
                classId,
                title,
                description,
                dueDate,
            },
        });

        const instances = await Promise.all(
            problems.map((entry) => {
                return tx.problemInstance.create({
                    data: {
                        assignmentId: assignment.id,
                        problemId: entry.problemId,
                        params: {
                            points: entry.points ?? 1,
                        },
                    },
                });
            })
        );

        return { assignment, instances };
    });
};

export const getClassAssignmentsForTutor = async ({ classId, teacherId }) => {
    return prisma.assignment.findMany({
        where: {
            classId,
            class: {
                teacherId,
            },
        },
        include: {
            problems: {
                select: { id: true },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const getTutorAssignmentDetailsRaw = async ({ assignmentId, teacherId }) => {
    return prisma.assignment.findFirst({
        where: {
            id: assignmentId,
            class: {
                teacherId,
            },
        },
        include: {
            class: {
                include: {
                    enrollments: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
            problems: {
                include: {
                    problem: {
                        select: {
                            id: true,
                            topic: true,
                            difficulty: true,
                        },
                    },
                },
            },
            reports: {
                select: {
                    id: true,
                    studentId: true,
                    data: true,
                    updatedAt: true,
                },
            },
        },
    });
};

export const getAssignmentSubmissionsRaw = async ({ assignmentId, teacherId }) => {
    return prisma.assignment.findFirst({
        where: {
            id: assignmentId,
            class: {
                teacherId,
            },
        },
        include: {
            class: {
                include: {
                    enrollments: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
            reports: {
                select: {
                    studentId: true,
                    data: true,
                    updatedAt: true,
                },
            },
        },
    });
};

export const getAssignmentForTeacher = async ({ assignmentId, teacherId }) => {
    return prisma.assignment.findFirst({
        where: {
            id: assignmentId,
            class: {
                teacherId,
            },
        },
        include: {
            problems: {
                include: {
                    problem: {
                        select: {
                            id: true,
                            topic: true,
                            difficulty: true,
                            templateCode: true,
                        },
                    },
                },
            },
        },
    });
};

export const getAssignmentReports = async ({ assignmentId }) => {
    return prisma.report.findMany({
        where: {
            assignmentId,
        },
    });
};

export const getClassStudentsForTeacher = async ({ classId, teacherId }) => {
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
                            email: true,
                            username: true,
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

export const createProblem = async ({ creatorId, templateCode, topic, difficulty }) => {
    return prisma.problem.create({
        data: {
            creatorId,
            templateCode,
            topic,
            difficulty,
        },
    });
};

export const getProblemById = async ({ problemId }) => {
    return prisma.problem.findUnique({
        where: {
            id: problemId,
        },
    });
};

export const getStudentReportsRaw = async ({ studentId }) => {
    return prisma.report.findMany({
        where: {
            studentId,
        },
        include: {
            assignment: {
                select: {
                    id: true,
                    title: true,
                    dueDate: true,
                    class: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
};

export const getAttemptsForAssignmentByProblem = async ({ assignmentId }) => {
    return prisma.attempt.findMany({
        where: {
            problemInstance: {
                assignmentId,
            },
        },
        select: {
            problemInstanceId: true,
            autoScore: true,
            finalScore: true,
        },
    });
};
