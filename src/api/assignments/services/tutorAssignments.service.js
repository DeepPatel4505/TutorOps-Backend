import ApiError from '#entities/ApiError.js';
import {
    addProblemInstancesToAssignment,
    createAssignmentWithProblems,
    createAttempt,
    createReport,
    findAttemptByProblemAndStudent,
    findClassByTeacher,
    findReportByAssignmentAndStudent,
    getAssignmentForTeacher,
    getAssignmentMutationStats,
    getAssignmentReports,
    getAssignmentSubmissionsRaw,
    getAttemptsForAssignmentByProblem,
    getClassAssignmentsForTutor,
    getClassStudentsForTeacher,
    getProblemTemplatesByIdsAndCreator,
    getTutorAssignmentDetailsRaw,
    getStudentAttemptsForAssignment,
    replaceAssignmentProblemInstances,
    updateAssignmentDetails,
    updateAttempt,
    updateReport,
} from '../daos/assignment.dao.js';

const resolveScore = (attempt) => {
    if (typeof attempt.finalScore === 'number') return attempt.finalScore;
    if (typeof attempt.autoScore === 'number') return attempt.autoScore;
    return 0;
};

const getReportStatus = (report) => {
    if (!report?.data?.status) return 'not_submitted';
    if (report.data.status === 'graded') return 'graded';
    if (report.data.status === 'submitted') return 'submitted';
    return 'not_submitted';
};

export const createTutorAssignment = async ({ classId, teacherId, payload }) => {
    const ownedClass = await findClassByTeacher({ classId, teacherId });

    if (!ownedClass) {
        throw ApiError.forbidden('You are not allowed to create assignments for this class', {}, `/tutor/classes/${classId}/assignments`);
    }

    const dueDate = payload.dueDate ? new Date(payload.dueDate) : null;

    const assignment = await createAssignmentWithProblems({
        classId,
        title: payload.title,
        description: payload.description,
        dueDate,
    });

    return {
        assignmentId: assignment.id,
        classId,
        title: assignment.title,
        dueDate: assignment.dueDate,
        totalProblems: 0,
    };
};

export const addProblemsToTutorAssignment = async ({ assignmentId, teacherId, problemTemplates }) => {
    const assignment = await getAssignmentForTeacher({ assignmentId, teacherId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found', {}, `/assignments/${assignmentId}/problems`);
    }

    const problemIds = [...new Set(problemTemplates.map((entry) => entry.problemId))];
    const templates = await getProblemTemplatesByIdsAndCreator({
        problemIds,
        creatorId: teacherId,
    });

    if (templates.length !== problemIds.length) {
        throw ApiError.forbidden('One or more problem templates are missing or not owned by teacher', {}, `/assignments/${assignmentId}/problems`);
    }

    const createdInstances = await addProblemInstancesToAssignment({
        assignmentId,
        problemTemplates,
    });

    return {
        assignmentId,
        createdCount: createdInstances.length,
        problems: createdInstances,
    };
};

export const updateTutorAssignment = async ({ assignmentId, teacherId, payload }) => {
    const assignment = await getAssignmentForTeacher({ assignmentId, teacherId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found', {}, `/tutor/assignments/${assignmentId}`);
    }

    const mutationStats = await getAssignmentMutationStats({ assignmentId });
    const problemTemplatesProvided = Array.isArray(payload.problemTemplates);
    const shouldReplaceProblems = problemTemplatesProvided && payload.problemTemplates.length > 0;

    if (problemTemplatesProvided && (mutationStats.reportCount > 0 || mutationStats.attemptCount > 0)) {
        throw ApiError.badRequest('Assignment problems cannot be edited after students have submissions', {}, `/tutor/assignments/${assignmentId}`);
    }

    const dueDate = payload.dueDate === null ? null : payload.dueDate ? new Date(payload.dueDate) : undefined;

    const updatedAssignment = await updateAssignmentDetails({
        assignmentId,
        title: payload.title,
        description: payload.description,
        dueDate,
    });

    let problems = assignment.problems;

    if (shouldReplaceProblems) {
        const problemIds = [...new Set(payload.problemTemplates.map((entry) => entry.problemId))];
        const templates = await getProblemTemplatesByIdsAndCreator({
            problemIds,
            creatorId: teacherId,
        });

        if (templates.length !== problemIds.length) {
            throw ApiError.forbidden('One or more problem templates are missing or not owned by teacher', {}, `/tutor/assignments/${assignmentId}`);
        }

        problems = await replaceAssignmentProblemInstances({
            assignmentId,
            problemTemplates: payload.problemTemplates,
        });
    }

    return {
        assignmentId: updatedAssignment.id,
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        dueDate: updatedAssignment.dueDate,
        totalProblems: problems.length,
    };
};

export const listTutorClassAssignments = async ({ classId, teacherId }) => {
    const assignments = await getClassAssignmentsForTutor({ classId, teacherId });

    return assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        totalProblems: assignment.problems.length,
    }));
};

export const getTutorAssignmentDetails = async ({ assignmentId, teacherId }) => {
    const assignment = await getTutorAssignmentDetailsRaw({ assignmentId, teacherId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found', {}, `/tutor/assignments/${assignmentId}`);
    }

    const totalStudents = assignment.class.enrollments.length;
    const submitted = assignment.reports.filter((report) => report?.data?.status === 'submitted').length;
    const graded = assignment.reports.filter((report) => report?.data?.status === 'graded').length;

    return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        class: {
            id: assignment.class.id,
            name: assignment.class.name,
        },
        totalProblems: assignment.problems.length,
        problems: assignment.problems.map((instance) => ({
            problemInstanceId: instance.id,
            problemId: instance.problemId,
            params: instance.params,
            latex: instance.latex,
            answer: instance.answer,
            problem: instance.problem,
        })),
        stats: {
            totalStudents,
            submitted,
            graded,
            notSubmitted: Math.max(totalStudents - submitted - graded, 0),
        },
    };
};

export const getTutorAssignmentSubmissions = async ({ assignmentId, teacherId }) => {
    const assignment = await getAssignmentSubmissionsRaw({ assignmentId, teacherId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found', {}, `/tutor/assignments/${assignmentId}/submissions`);
    }

    const reportByStudentId = new Map(assignment.reports.map((item) => [item.studentId, item]));

    return assignment.class.enrollments.map((enrollment) => {
        const student = enrollment.student;
        const report = reportByStudentId.get(student.id);

        return {
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            status: getReportStatus(report),
            submittedAt: report?.data?.submittedAt || null,
            gradedAt: report?.data?.gradedAt || null,
            score: report?.data?.finalScore ?? report?.data?.autoScore ?? null,
        };
    });
};

export const getTutorStudentSubmission = async ({ assignmentId, studentId, teacherId }) => {
    const assignment = await getAssignmentForTeacher({ assignmentId, teacherId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found', {}, `/tutor/assignments/${assignmentId}/submissions/${studentId}`);
    }

    const report = await findReportByAssignmentAndStudent({ assignmentId, studentId });
    const attempts = await getStudentAttemptsForAssignment({ assignmentId, studentId });

    return {
        assignment: {
            id: assignment.id,
            title: assignment.title,
            dueDate: assignment.dueDate,
        },
        studentId,
        status: report?.data?.status || 'not_submitted',
        autoScore: report?.data?.autoScore ?? null,
        finalScore: report?.data?.finalScore ?? null,
        attempts: attempts.map((attempt) => ({
            attemptId: attempt.id,
            problemInstanceId: attempt.problemInstanceId,
            problem: attempt.problemInstance.problem,
            response: attempt.response,
            autoScore: attempt.autoScore,
            finalScore: attempt.finalScore,
            teacherComment: attempt.teacherComment,
            submittedAt: attempt.submittedAt,
        })),
    };
};

export const gradeTutorStudentSubmission = async ({ assignmentId, studentId, teacherId, payload }) => {
    const assignment = await getAssignmentForTeacher({ assignmentId, teacherId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found', {}, `/tutor/assignments/${assignmentId}/submissions/${studentId}/grade`);
    }

    const validProblemIds = new Set(assignment.problems.map((item) => item.id));

    for (const grade of payload.grades) {
        if (!validProblemIds.has(grade.problemInstanceId)) {
            throw ApiError.badRequest(`Invalid problemInstanceId: ${grade.problemInstanceId}`, {}, `/tutor/assignments/${assignmentId}/submissions/${studentId}/grade`);
        }

        const existingAttempt = await findAttemptByProblemAndStudent({
            problemInstanceId: grade.problemInstanceId,
            studentId,
        });

        if (!existingAttempt) {
            await createAttempt({
                problemInstanceId: grade.problemInstanceId,
                studentId,
                response: null,
                autoScore: null,
                finalScore: grade.score,
                teacherComment: grade.feedback || null,
            });
        } else {
            await updateAttempt({
                attemptId: existingAttempt.id,
                response: existingAttempt.response,
                autoScore: existingAttempt.autoScore,
                finalScore: grade.score,
                teacherComment: grade.feedback || existingAttempt.teacherComment,
            });
        }
    }

    const attempts = await getStudentAttemptsForAssignment({ assignmentId, studentId });
    const computedScore = attempts.reduce((sum, attempt) => sum + resolveScore(attempt), 0);
    const finalScore = typeof payload.finalScore === 'number' ? payload.finalScore : computedScore;

    const report = await findReportByAssignmentAndStudent({ assignmentId, studentId });
    const nextData = {
        ...(report?.data || {}),
        status: 'graded',
        gradedAt: new Date().toISOString(),
        finalScore,
        feedback: payload.grades,
    };

    if (!report) {
        await createReport({ assignmentId, studentId, data: nextData });
    } else {
        await updateReport({ reportId: report.id, data: nextData });
    }

    return {
        assignmentId,
        studentId,
        status: 'graded',
        finalScore,
    };
};

export const triggerTutorAutoGrade = async ({ assignmentId, teacherId }) => {
    const assignment = await getAssignmentForTeacher({ assignmentId, teacherId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found', {}, `/tutor/assignments/${assignmentId}/auto-grade`);
    }

    const reports = await getAssignmentReports({ assignmentId });
    const submittedReports = reports.filter((item) => item?.data?.status === 'submitted');

    let processedStudents = 0;

    for (const report of submittedReports) {
        const attempts = await getStudentAttemptsForAssignment({
            assignmentId,
            studentId: report.studentId,
        });

        if (attempts.length === 0) continue;

        for (const attempt of attempts) {
            if (attempt.finalScore === null && attempt.autoScore !== null) {
                await updateAttempt({
                    attemptId: attempt.id,
                    response: attempt.response,
                    autoScore: attempt.autoScore,
                    finalScore: attempt.autoScore,
                    teacherComment: attempt.teacherComment,
                });
            }
        }

        const refreshedAttempts = await getStudentAttemptsForAssignment({
            assignmentId,
            studentId: report.studentId,
        });

        const finalScore = refreshedAttempts.reduce((sum, attempt) => sum + resolveScore(attempt), 0);

        await updateReport({
            reportId: report.id,
            data: {
                ...report.data,
                status: 'graded',
                gradedAt: new Date().toISOString(),
                finalScore,
            },
        });

        processedStudents += 1;
    }

    return {
        assignmentId,
        processedStudents,
    };
};

export const getTutorAssignmentAnalytics = async ({ assignmentId, teacherId }) => {
    const details = await getTutorAssignmentDetailsRaw({ assignmentId, teacherId });

    if (!details) {
        throw ApiError.notFound('Assignment not found', {}, `/tutor/assignments/${assignmentId}/analytics`);
    }

    const totalStudents = details.class.enrollments.length;
    const submittedReports = details.reports.filter((item) => item?.data?.status === 'submitted' || item?.data?.status === 'graded');
    const gradedReports = details.reports.filter((item) => item?.data?.status === 'graded');

    const completionRate = totalStudents > 0 ? Number(((submittedReports.length / totalStudents) * 100).toFixed(2)) : 0;

    const avgScore =
        gradedReports.length > 0
            ? Number(
                (
                    gradedReports.reduce((sum, report) => sum + Number(report?.data?.finalScore ?? report?.data?.autoScore ?? 0), 0) /
                    gradedReports.length
                ).toFixed(2)
            )
            : 0;

    const attemptRows = await getAttemptsForAssignmentByProblem({ assignmentId });
    const statsByProblem = new Map();

    for (const row of attemptRows) {
        const score = typeof row.finalScore === 'number' ? row.finalScore : Number(row.autoScore ?? 0);

        if (!statsByProblem.has(row.problemInstanceId)) {
            statsByProblem.set(row.problemInstanceId, { total: 0, count: 0 });
        }

        const current = statsByProblem.get(row.problemInstanceId);
        current.total += score;
        current.count += 1;
    }

    const hardQuestions = Array.from(statsByProblem.entries())
        .map(([problemInstanceId, stats]) => ({
            problemInstanceId,
            averageScore: stats.count > 0 ? Number((stats.total / stats.count).toFixed(2)) : 0,
            attempts: stats.count,
        }))
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 5);

    return {
        assignmentId,
        averageScore: avgScore,
        completionRate,
        submittedCount: submittedReports.length,
        gradedCount: gradedReports.length,
        totalStudents,
        hardQuestions,
    };
};

export const getTeacherClassStudents = async ({ classId, teacherId }) => {
    const classRoom = await getClassStudentsForTeacher({ classId, teacherId });

    if (!classRoom) {
        throw ApiError.notFound('Class not found for teacher', {}, `/classes/${classId}/students`);
    }

    return {
        class: {
            id: classRoom.id,
            name: classRoom.name,
        },
        students: classRoom.enrollments.map((enrollment) => ({
            enrollmentId: enrollment.id,
            joinedAt: enrollment.joinedAt,
            ...enrollment.student,
        })),
    };
};
