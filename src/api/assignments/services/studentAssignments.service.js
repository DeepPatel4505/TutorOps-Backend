import ApiError from '#entities/ApiError.js';
import {
    createAttempt,
    createReport,
    findAttemptByProblemAndStudent,
    findReportByAssignmentAndStudent,
    getStudentAssignmentDetailsRaw,
    getStudentAssignmentsRaw,
    getStudentAttemptsForAssignment,
    getStudentReportsRaw,
    updateAttempt,
    updateReport,
} from '../daos/assignment.dao.js';

const getReportStatus = (report) => {
    const status = report?.data?.status;

    if (status === 'graded') return 'graded';
    if (status === 'submitted') return 'submitted';
    return 'assigned';
};

const normalizeComparable = (value) => {
    if (typeof value === 'string') return value.trim().toLowerCase();
    return JSON.stringify(value);
};

const resolvePoints = (problemInstance) => {
    const points = Number(problemInstance?.params?.points ?? 1);
    return Number.isFinite(points) && points >= 0 ? points : 1;
};

const gradeObjectiveAnswer = ({ expectedAnswer, responseAnswer, points }) => {
    if (expectedAnswer === null || expectedAnswer === undefined) {
        return null;
    }

    const isCorrect = normalizeComparable(expectedAnswer) === normalizeComparable(responseAnswer);
    return isCorrect ? points : 0;
};

export const listStudentAssignments = async ({ studentId, status }) => {
    const assignments = await getStudentAssignmentsRaw({ studentId });

    const mapped = assignments.map((assignment) => {
        const report = assignment.reports[0] || null;
        const computedStatus = getReportStatus(report);

        return {
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            class: assignment.class,
            totalProblems: assignment.problems.length,
            status: computedStatus,
            lastUpdatedAt: report?.updatedAt || assignment.updatedAt,
        };
    });

    if (!status) return mapped;

    const validStatuses = new Set(['assigned', 'submitted', 'graded']);
    if (!validStatuses.has(status)) {
        throw ApiError.badRequest('Invalid status filter. Use assigned | submitted | graded', {}, '/student/assignments');
    }

    return mapped.filter((item) => item.status === status);
};

export const getStudentAssignmentDetails = async ({ assignmentId, studentId }) => {
    const assignment = await getStudentAssignmentDetailsRaw({ assignmentId, studentId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found for this student', {}, `/student/assignments/${assignmentId}`);
    }

    const report = assignment.reports[0] || null;

    return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        class: assignment.class,
        status: getReportStatus(report),
        submissionMeta: report?.data || null,
        problems: assignment.problems.map((instance) => ({
            problemInstanceId: instance.id,
            points: resolvePoints(instance),
            problem: instance.problem,
            latex: instance.latex,
            params: instance.params,
        })),
    };
};

export const startStudentAssignment = async ({ assignmentId, studentId }) => {
    const assignment = await getStudentAssignmentDetailsRaw({ assignmentId, studentId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found for this student', {}, `/student/assignments/${assignmentId}/start`);
    }

    const existingReport = await findReportByAssignmentAndStudent({ assignmentId, studentId });

    const now = new Date().toISOString();

    const currentData = existingReport?.data || {};
    const nextData = {
        ...currentData,
        status: currentData.status || 'assigned',
        startedAt: currentData.startedAt || now,
        lastStartedAt: now,
    };

    if (!existingReport) {
        await createReport({ assignmentId, studentId, data: nextData });
    } else {
        await updateReport({ reportId: existingReport.id, data: nextData });
    }

    return {
        assignmentId,
        startedAt: nextData.startedAt,
        status: nextData.status,
    };
};

export const submitStudentAssignment = async ({ assignmentId, studentId, answers }) => {
    const assignment = await getStudentAssignmentDetailsRaw({ assignmentId, studentId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found for this student', {}, `/student/assignments/${assignmentId}/submit`);
    }

    const problemMap = new Map(assignment.problems.map((item) => [item.id, item]));

    let maxScore = 0;
    let autoScoreTotal = 0;

    for (const item of assignment.problems) {
        maxScore += resolvePoints(item);
    }

    for (const answer of answers) {
        const problemInstance = problemMap.get(answer.problemInstanceId);

        if (!problemInstance) {
            throw ApiError.badRequest(`Invalid problemInstanceId: ${answer.problemInstanceId}`, {}, `/student/assignments/${assignmentId}/submit`);
        }

        const points = resolvePoints(problemInstance);
        const autoScore = gradeObjectiveAnswer({
            expectedAnswer: problemInstance.answer,
            responseAnswer: answer.answer,
            points,
        });

        if (typeof autoScore === 'number') {
            autoScoreTotal += autoScore;
        }

        const existingAttempt = await findAttemptByProblemAndStudent({
            problemInstanceId: answer.problemInstanceId,
            studentId,
        });

        if (!existingAttempt) {
            await createAttempt({
                problemInstanceId: answer.problemInstanceId,
                studentId,
                response: answer.answer,
                autoScore,
                finalScore: autoScore,
                teacherComment: null,
            });
        } else {
            await updateAttempt({
                attemptId: existingAttempt.id,
                response: answer.answer,
                autoScore,
                finalScore: autoScore,
                teacherComment: existingAttempt.teacherComment,
            });
        }
    }

    const report = await findReportByAssignmentAndStudent({ assignmentId, studentId });
    const now = new Date().toISOString();

    const mergedData = {
        ...(report?.data || {}),
        status: 'submitted',
        submittedAt: now,
        attemptedProblems: answers.length,
        totalProblems: assignment.problems.length,
        autoScore: autoScoreTotal,
        maxScore,
    };

    if (!report) {
        await createReport({ assignmentId, studentId, data: mergedData });
    } else {
        await updateReport({ reportId: report.id, data: mergedData });
    }

    return {
        assignmentId,
        status: 'submitted',
        autoScore: autoScoreTotal,
        maxScore,
        submittedAt: now,
    };
};

export const getStudentAssignmentResult = async ({ assignmentId, studentId }) => {
    const assignment = await getStudentAssignmentDetailsRaw({ assignmentId, studentId });

    if (!assignment) {
        throw ApiError.notFound('Assignment not found for this student', {}, `/student/assignments/${assignmentId}/result`);
    }

    const report = await findReportByAssignmentAndStudent({ assignmentId, studentId });
    const attempts = await getStudentAttemptsForAssignment({ assignmentId, studentId });

    const status = report?.data?.status === 'graded' ? 'graded' : 'pending';

    return {
        assignmentId: assignment.id,
        title: assignment.title,
        status,
        score: report?.data?.finalScore ?? report?.data?.autoScore ?? null,
        maxScore: report?.data?.maxScore ?? null,
        feedback: report?.data?.feedback || null,
        submittedAt: report?.data?.submittedAt || null,
        gradedAt: report?.data?.gradedAt || null,
        answers: attempts.map((attempt) => ({
            attemptId: attempt.id,
            problemInstanceId: attempt.problemInstanceId,
            response: attempt.response,
            autoScore: attempt.autoScore,
            finalScore: attempt.finalScore,
            teacherComment: attempt.teacherComment,
            submittedAt: attempt.submittedAt,
        })),
    };
};

export const getStudentReports = async ({ studentId }) => {
    const reports = await getStudentReportsRaw({ studentId });

    const rows = reports.map((report) => {
        const finalScore = Number(report?.data?.finalScore ?? report?.data?.autoScore ?? 0);

        return {
            reportId: report.id,
            assignmentId: report.assignment.id,
            assignmentTitle: report.assignment.title,
            class: report.assignment.class,
            dueDate: report.assignment.dueDate,
            generatedAt: report.generatedAt,
            status: report?.data?.status || 'submitted',
            finalScore,
            maxScore: Number(report?.data?.maxScore ?? 0),
            updatedAt: report.updatedAt,
        };
    });

    const graded = rows.filter((row) => row.status === 'graded');
    const averageScore =
        graded.length > 0
            ? Number((graded.reduce((sum, item) => sum + item.finalScore, 0) / graded.length).toFixed(2))
            : 0;

    return {
        items: rows,
        summary: {
            totalReports: rows.length,
            gradedReports: graded.length,
            averageScore,
        },
    };
};
