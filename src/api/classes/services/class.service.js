import ApiError from '#entities/ApiError.js';
import {
    createClass,
    createEnrollment,
    findClassByIdAndTeacher,
    findEnrollment,
    findUserById,
    getClassStudents,
    getTeacherClasses,
} from '../daos/class.dao.js';

export const createTeacherClass = async ({ teacherId, name }) => {
    const classRoom = await createClass({ teacherId, name });

    return {
        id: classRoom.id,
        name: classRoom.name,
        teacherId: classRoom.teacherId,
        createdAt: classRoom.createdAt,
    };
};

export const listTeacherClasses = async ({ teacherId }) => {
    const classes = await getTeacherClasses({ teacherId });

    return classes.map((entry) => ({
        id: entry.id,
        name: entry.name,
        createdAt: entry.createdAt,
        totalStudents: entry.enrollments.length,
        totalAssignments: entry.assignments.length,
    }));
};

export const enrollStudentToClass = async ({ teacherId, classId, studentId }) => {
    const classRoom = await findClassByIdAndTeacher({ classId, teacherId });
    if (!classRoom) {
        throw ApiError.notFound('Class not found for teacher', {}, `/tutor/classes/${classId}/enroll`);
    }

    const student = await findUserById({ userId: studentId });
    if (!student) {
        throw ApiError.notFound('Student not found', {}, `/tutor/classes/${classId}/enroll`);
    }

    if (student.role !== 'STUDENT') {
        throw ApiError.badRequest('Only STUDENT users can be enrolled', {}, `/tutor/classes/${classId}/enroll`);
    }

    const existing = await findEnrollment({ classId, studentId });
    if (existing) {
        throw ApiError.badRequest('Student is already enrolled in this class', {}, `/tutor/classes/${classId}/enroll`);
    }

    const enrollment = await createEnrollment({ classId, studentId });

    return {
        enrollmentId: enrollment.id,
        classId,
        student,
        joinedAt: enrollment.joinedAt,
    };
};

export const listClassStudentsForTeacher = async ({ teacherId, classId }) => {
    const classRoom = await getClassStudents({ classId, teacherId });

    if (!classRoom) {
        throw ApiError.notFound('Class not found for teacher', {}, `/tutor/classes/${classId}/students`);
    }

    return {
        class: {
            id: classRoom.id,
            name: classRoom.name,
        },
        students: classRoom.enrollments.map((entry) => ({
            enrollmentId: entry.id,
            joinedAt: entry.joinedAt,
            ...entry.student,
        })),
    };
};
