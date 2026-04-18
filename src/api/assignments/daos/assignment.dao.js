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

export const createAssignmentWithProblems = async ({ classId, title, description, dueDate }) => {
    return prisma.assignment.create({
        data: {
            classId,
            title,
            description,
            dueDate,
        },
    });
};

export const getAssignmentMutationStats = async ({ assignmentId }) => {
    const [reportCount, attemptCount] = await Promise.all([
        prisma.report.count({
            where: { assignmentId },
        }),
        prisma.attempt.count({
            where: {
                problemInstance: {
                    assignmentId,
                },
            },
        }),
    ]);

    return { reportCount, attemptCount };
};

export const updateAssignmentDetails = async ({ assignmentId, title, description, dueDate }) => {
    const data = {
        ...(typeof title === 'string' ? { title } : {}),
        ...(description === undefined ? {} : { description }),
        ...(dueDate === undefined ? {} : { dueDate }),
    };

    if (Object.keys(data).length === 0) {
        return prisma.assignment.findUnique({
            where: { id: assignmentId },
        });
    }

    return prisma.assignment.update({
        where: { id: assignmentId },
        data,
    });
};

export const replaceAssignmentProblemInstances = async ({ assignmentId, problemTemplates }) => {
    return prisma.$transaction(async (tx) => {
        await tx.problemInstance.deleteMany({
            where: { assignmentId },
        });

        const created = await Promise.all(
            problemTemplates.map((entry) =>
                tx.problemInstance.create({
                    data: {
                        assignmentId,
                        problemId: entry.problemId,
                        params: entry.params ?? null,
                        latex: entry.latex ?? null,
                        answer: entry.answer ?? null,
                    },
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
                })
            )
        );

        return created;
    });
};

export const addProblemInstancesToAssignment = async ({ assignmentId, problemTemplates }) => {
    return prisma.$transaction(async (tx) => {
        const instances = await Promise.all(
            problemTemplates.map((entry) => {
                return tx.problemInstance.create({
                    data: {
                        assignmentId,
                        problemId: entry.problemId,
                        params: entry.params ?? null,
                        latex: entry.latex ?? null,
                        answer: entry.answer ?? null,
                    },
                    include: {
                        problem: {
                            select: {
                                id: true,
                                topic: true,
                                difficulty: true,
                            },
                        },
                    },
                });
            })
        );

        return instances;
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
                            templateCode: true,
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

export const getProblemTemplatesByCreator = async ({ creatorId }) => {
    return prisma.problem.findMany({
        where: {
            creatorId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const getProblemTemplatesByIdsAndCreator = async ({ problemIds, creatorId }) => {
    return prisma.problem.findMany({
        where: {
            id: {
                in: problemIds,
            },
            creatorId,
        },
        select: {
            id: true,
            topic: true,
            difficulty: true,
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
