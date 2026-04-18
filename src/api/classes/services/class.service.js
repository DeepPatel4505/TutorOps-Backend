import ApiError from '#entities/ApiError.js';
import {
    createClass,
    createEnrollmentsBulk,
    findClassByIdAndTeacher,
    findUsersByIds,
    getEnrollmentsForClassAndStudents,
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

export const enrollStudentToClass = async ({ teacherId, classId, studentIds }) => {
    const classRoom = await findClassByIdAndTeacher({ classId, teacherId });
    if (!classRoom) {
        throw ApiError.notFound('Class not found for teacher', {}, `/tutor/classes/${classId}/enroll`);
    }

    const uniqueStudentIds = [...new Set(studentIds)];
    const students = await findUsersByIds({ userIds: uniqueStudentIds });

    if (students.length !== uniqueStudentIds.length) {
        throw ApiError.badRequest('One or more studentIds are invalid', {}, `/tutor/classes/${classId}/enroll`);
    }

    const invalidRoleStudent = students.find((student) => student.role !== 'STUDENT');
    if (invalidRoleStudent) {
        throw ApiError.badRequest('Only STUDENT users can be enrolled', {}, `/tutor/classes/${classId}/enroll`);
    }

    const existingEnrollments = await getEnrollmentsForClassAndStudents({ classId, studentIds: uniqueStudentIds });
    const alreadyEnrolledIds = new Set(existingEnrollments.map((entry) => entry.studentId));
    const newStudentIds = uniqueStudentIds.filter((id) => !alreadyEnrolledIds.has(id));

    if (newStudentIds.length > 0) {
        await createEnrollmentsBulk({ classId, studentIds: newStudentIds });
    }

    return {
        classId,
        requested: uniqueStudentIds.length,
        enrolledCount: newStudentIds.length,
        alreadyEnrolledCount: alreadyEnrolledIds.size,
        enrolledStudentIds: newStudentIds,
        alreadyEnrolledStudentIds: Array.from(alreadyEnrolledIds),
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
