import ApiError from '#entities/ApiError.js';
import ApiResponse from '#entities/ApiResponse.js';
import {
    createTutorAssignment,
    getTeacherClassStudents,
    getTutorAssignmentAnalytics,
    getTutorAssignmentDetails,
    getTutorAssignmentSubmissions,
    getTutorStudentSubmission,
    gradeTutorStudentSubmission,
    listTutorClassAssignments,
    triggerTutorAutoGrade,
} from '../services/tutorAssignments.service.js';

export const createTutorAssignmentController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { classId } = req.params;
        const result = await createTutorAssignment({ classId, teacherId, payload: req.body });
        return res.status(201).json(new ApiResponse(result, 'Assignment created successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to create assignment', err, req.originalUrl));
    }
};

export const listTutorClassAssignmentsController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { classId } = req.params;
        const result = await listTutorClassAssignments({ classId, teacherId });
        return res.status(200).json(new ApiResponse({ assignments: result }, 'Class assignments fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch class assignments', err, req.originalUrl));
    }
};

export const getTutorAssignmentDetailsController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { assignmentId } = req.params;
        const result = await getTutorAssignmentDetails({ assignmentId, teacherId });
        return res.status(200).json(new ApiResponse(result, 'Assignment details fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch assignment details', err, req.originalUrl));
    }
};

export const getTutorAssignmentSubmissionsController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { assignmentId } = req.params;
        const result = await getTutorAssignmentSubmissions({ assignmentId, teacherId });
        return res.status(200).json(new ApiResponse({ submissions: result }, 'Assignment submissions fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch submissions', err, req.originalUrl));
    }
};

export const getTutorStudentSubmissionController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { assignmentId, studentId } = req.params;
        const result = await getTutorStudentSubmission({ assignmentId, studentId, teacherId });
        return res.status(200).json(new ApiResponse(result, 'Student submission fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch student submission', err, req.originalUrl));
    }
};

export const gradeTutorStudentSubmissionController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { assignmentId, studentId } = req.params;
        const result = await gradeTutorStudentSubmission({
            assignmentId,
            studentId,
            teacherId,
            payload: req.body,
        });
        return res.status(200).json(new ApiResponse(result, 'Submission graded successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to grade submission', err, req.originalUrl));
    }
};

export const triggerTutorAutoGradeController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { assignmentId } = req.params;
        const result = await triggerTutorAutoGrade({ assignmentId, teacherId });
        return res.status(200).json(new ApiResponse(result, 'Auto-grade completed'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to auto-grade submissions', err, req.originalUrl));
    }
};

export const getTutorAssignmentAnalyticsController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { assignmentId } = req.params;
        const result = await getTutorAssignmentAnalytics({ assignmentId, teacherId });
        return res.status(200).json(new ApiResponse(result, 'Assignment analytics fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch assignment analytics', err, req.originalUrl));
    }
};

export const getTeacherClassStudentsController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { classId } = req.params;
        const result = await getTeacherClassStudents({ classId, teacherId });
        return res.status(200).json(new ApiResponse(result, 'Class students fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch class students', err, req.originalUrl));
    }
};
