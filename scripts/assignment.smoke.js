import prisma from '../src/utils/prisma.js';
import { createTutorAssignment, gradeTutorStudentSubmission } from '../src/api/assignments/services/tutorAssignments.service.js';
import { submitStudentAssignment } from '../src/api/assignments/services/studentAssignments.service.js';

const run = async () => {
    const stamp = Date.now();

    const created = {
        teacherId: null,
        studentId: null,
        classId: null,
        enrollmentId: null,
        problemId: null,
        assignmentId: null,
        problemInstanceId: null,
    };

    try {
        const teacher = await prisma.user.create({
            data: {
                name: `Smoke Teacher ${stamp}`,
                username: `smoke_teacher_${stamp}`,
                email: `smoke.teacher.${stamp}@example.com`,
                role: 'TEACHER',
                password: null,
                isVerified: true,
            },
        });
        created.teacherId = teacher.id;

        const student = await prisma.user.create({
            data: {
                name: `Smoke Student ${stamp}`,
                username: `smoke_student_${stamp}`,
                email: `smoke.student.${stamp}@example.com`,
                role: 'STUDENT',
                password: null,
                isVerified: true,
            },
        });
        created.studentId = student.id;

        const classRoom = await prisma.class.create({
            data: {
                name: `Smoke Class ${stamp}`,
                teacherId: teacher.id,
            },
        });
        created.classId = classRoom.id;

        const enrollment = await prisma.enrollment.create({
            data: {
                classId: classRoom.id,
                studentId: student.id,
            },
        });
        created.enrollmentId = enrollment.id;

        const problem = await prisma.problem.create({
            data: {
                templateCode: '2 + 2 = ?',
                topic: 'Arithmetic',
                difficulty: 'easy',
                creatorId: teacher.id,
            },
        });
        created.problemId = problem.id;

        const createResult = await createTutorAssignment({
            classId: classRoom.id,
            teacherId: teacher.id,
            payload: {
                title: 'Smoke Assignment',
                description: 'Service smoke test assignment',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                problems: [
                    {
                        problemId: problem.id,
                        points: 5,
                    },
                ],
            },
        });

        created.assignmentId = createResult.assignmentId;

        const problemInstance = await prisma.problemInstance.findFirst({
            where: { assignmentId: created.assignmentId },
            select: { id: true },
        });

        if (!problemInstance) {
            throw new Error('No problem instance created for smoke assignment');
        }

        created.problemInstanceId = problemInstance.id;

        const submitResult = await submitStudentAssignment({
            assignmentId: created.assignmentId,
            studentId: student.id,
            answers: [
                {
                    problemInstanceId: problemInstance.id,
                    answer: '4',
                },
            ],
        });

        const gradeResult = await gradeTutorStudentSubmission({
            assignmentId: created.assignmentId,
            studentId: student.id,
            teacherId: teacher.id,
            payload: {
                grades: [
                    {
                        problemInstanceId: problemInstance.id,
                        score: 4,
                        feedback: 'Good attempt',
                    },
                ],
                finalScore: 4,
            },
        });

        const report = await prisma.report.findFirst({
            where: {
                assignmentId: created.assignmentId,
                studentId: student.id,
            },
            select: {
                data: true,
            },
        });

        console.log('SMOKE_TEST_PASS');
        console.log(JSON.stringify({ createResult, submitResult, gradeResult, report }, null, 2));
    } catch (err) {
        console.error('SMOKE_TEST_FAIL');
        console.error(err);
        process.exitCode = 1;
    } finally {
        try {
            if (created.assignmentId && created.studentId) {
                await prisma.attempt.deleteMany({
                    where: {
                        studentId: created.studentId,
                        problemInstance: {
                            assignmentId: created.assignmentId,
                        },
                    },
                });

                await prisma.report.deleteMany({
                    where: {
                        assignmentId: created.assignmentId,
                        studentId: created.studentId,
                    },
                });

                await prisma.problemInstance.deleteMany({
                    where: {
                        assignmentId: created.assignmentId,
                    },
                });

                await prisma.assignment.deleteMany({
                    where: {
                        id: created.assignmentId,
                    },
                });
            }

            if (created.enrollmentId) {
                await prisma.enrollment.deleteMany({
                    where: { id: created.enrollmentId },
                });
            }

            if (created.classId) {
                await prisma.class.deleteMany({
                    where: { id: created.classId },
                });
            }

            if (created.problemId) {
                await prisma.problem.deleteMany({
                    where: { id: created.problemId },
                });
            }

            if (created.studentId) {
                await prisma.user.deleteMany({ where: { id: created.studentId } });
            }

            if (created.teacherId) {
                await prisma.user.deleteMany({ where: { id: created.teacherId } });
            }
        } catch (cleanupErr) {
            console.error('SMOKE_CLEANUP_WARNING');
            console.error(cleanupErr);
        }

        await prisma.$disconnect();
    }
};

run();
