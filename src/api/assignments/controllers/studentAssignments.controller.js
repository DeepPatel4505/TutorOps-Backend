import ApiError from '#entities/ApiError.js';
import ApiResponse from '#entities/ApiResponse.js';
import {
    getStudentAssignmentDetails,
    getStudentAssignmentResult,
    getStudentReports,
    listStudentAssignments,
    startStudentAssignment,
    submitStudentAssignment,
} from '../services/studentAssignments.service.js';

export const listStudentAssignmentsController = async (req, res, next) => {
    try {
        const studentId = req.session.user.id;
        const status = req.query.status;
        const result = await listStudentAssignments({ studentId, status });
        return res.status(200).json(new ApiResponse({ assignments: result }, 'Assignments fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch assignments', err, req.originalUrl));
    }
};

export const getStudentAssignmentDetailsController = async (req, res, next) => {
    try {
        const studentId = req.session.user.id;
        const { assignmentId } = req.params;
        const result = await getStudentAssignmentDetails({ assignmentId, studentId });
        return res.status(200).json(new ApiResponse(result, 'Assignment details fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch assignment details', err, req.originalUrl));
    }
};

export const startStudentAssignmentController = async (req, res, next) => {
    try {
        const studentId = req.session.user.id;
        const { assignmentId } = req.params;
        const result = await startStudentAssignment({ assignmentId, studentId });
        return res.status(200).json(new ApiResponse(result, 'Assignment session started'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to start assignment', err, req.originalUrl));
    }
};

export const submitStudentAssignmentController = async (req, res, next) => {
    try {
        const studentId = req.session.user.id;
        const { assignmentId } = req.params;
        const { answers } = req.body;
        const result = await submitStudentAssignment({ assignmentId, studentId, answers });
        return res.status(200).json(new ApiResponse(result, 'Assignment submitted successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to submit assignment', err, req.originalUrl));
    }
};

export const getStudentAssignmentResultController = async (req, res, next) => {
    try {
        const studentId = req.session.user.id;
        const { assignmentId } = req.params;
        const result = await getStudentAssignmentResult({ assignmentId, studentId });
        return res.status(200).json(new ApiResponse(result, 'Assignment result fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch assignment result', err, req.originalUrl));
    }
};

export const getStudentReportsController = async (req, res, next) => {
    try {
        const studentId = req.session.user.id;
        const result = await getStudentReports({ studentId });
        return res.status(200).json(new ApiResponse(result, 'Student reports fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch reports', err, req.originalUrl));
    }
};
