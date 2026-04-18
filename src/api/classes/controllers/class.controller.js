import ApiError from '#entities/ApiError.js';
import ApiResponse from '#entities/ApiResponse.js';
import {
    createTeacherClass,
    enrollStudentToClass,
    listClassStudentsForTeacher,
    listTeacherClasses,
} from '../services/class.service.js';

export const createClassController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { name } = req.body;
        const result = await createTeacherClass({ teacherId, name });
        return res.status(201).json(new ApiResponse(result, 'Class created successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to create class', err, req.originalUrl));
    }
};

export const listClassesController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const result = await listTeacherClasses({ teacherId });
        return res.status(200).json(new ApiResponse({ classes: result }, 'Classes fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch classes', err, req.originalUrl));
    }
};

export const enrollStudentController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { classId } = req.params;
        const { studentIds } = req.body;
        const result = await enrollStudentToClass({ teacherId, classId, studentIds });
        return res.status(201).json(new ApiResponse(result, 'Students enrolled successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to enroll student', err, req.originalUrl));
    }
};

export const listClassStudentsController = async (req, res, next) => {
    try {
        const teacherId = req.session.user.id;
        const { classId } = req.params;
        const result = await listClassStudentsForTeacher({ teacherId, classId });
        return res.status(200).json(new ApiResponse(result, 'Class students fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch class students', err, req.originalUrl));
    }
};
