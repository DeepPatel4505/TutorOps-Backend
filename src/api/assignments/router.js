import { Router } from 'express';
import isAuthenticated from '#src/middlewares/isAuthenticated.js';
import roleCheck from '#src/middlewares/roleCheck.js';
import zodValidator from '#src/middlewares/zodValidator.js';

import {
    getStudentAssignmentDetailsController,
    getStudentAssignmentResultController,
    getStudentReportsController,
    listStudentAssignmentsController,
    startStudentAssignmentController,
    submitStudentAssignmentController,
} from './controllers/studentAssignments.controller.js';
import {
    createTutorAssignmentController,
    getTeacherClassStudentsController,
    getTutorAssignmentAnalyticsController,
    getTutorAssignmentDetailsController,
    getTutorAssignmentSubmissionsController,
    getTutorStudentSubmissionController,
    gradeTutorStudentSubmissionController,
    listTutorClassAssignmentsController,
    triggerTutorAutoGradeController,
} from './controllers/tutorAssignments.controller.js';
import {
    createProblemController,
    generateProblemsController,
    getProblemController,
} from './controllers/sharedAssignments.controller.js';
import { createAssignmentSchema } from './dtos/createAssignment.dto.js';
import { gradeSubmissionSchema } from './dtos/gradeSubmission.dto.js';
import { createProblemSchema, generateProblemsSchema } from './dtos/problem.dto.js';
import { submitAssignmentSchema } from './dtos/submitAssignment.dto.js';

const router = Router();

// Student routes
router.get('/student/assignments', isAuthenticated, roleCheck('STUDENT'), listStudentAssignmentsController);
router.get('/student/assignments/:assignmentId', isAuthenticated, roleCheck('STUDENT'), getStudentAssignmentDetailsController);
router.post('/student/assignments/:assignmentId/start', isAuthenticated, roleCheck('STUDENT'), startStudentAssignmentController);
router.post(
    '/student/assignments/:assignmentId/submit',
    isAuthenticated,
    roleCheck('STUDENT'),
    zodValidator(submitAssignmentSchema),
    submitStudentAssignmentController
);
router.get('/student/assignments/:assignmentId/result', isAuthenticated, roleCheck('STUDENT'), getStudentAssignmentResultController);
router.get('/student/reports', isAuthenticated, roleCheck('STUDENT'), getStudentReportsController);

// Tutor routes
router.post(
    '/tutor/classes/:classId/assignments',
    isAuthenticated,
    roleCheck('TEACHER', 'ADMIN'),
    zodValidator(createAssignmentSchema),
    createTutorAssignmentController
);
router.get('/tutor/classes/:classId/assignments', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), listTutorClassAssignmentsController);
router.get('/tutor/assignments/:assignmentId', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), getTutorAssignmentDetailsController);
router.get(
    '/tutor/assignments/:assignmentId/submissions',
    isAuthenticated,
    roleCheck('TEACHER', 'ADMIN'),
    getTutorAssignmentSubmissionsController
);
router.get(
    '/tutor/assignments/:assignmentId/submissions/:studentId',
    isAuthenticated,
    roleCheck('TEACHER', 'ADMIN'),
    getTutorStudentSubmissionController
);
router.post(
    '/tutor/assignments/:assignmentId/submissions/:studentId/grade',
    isAuthenticated,
    roleCheck('TEACHER', 'ADMIN'),
    zodValidator(gradeSubmissionSchema),
    gradeTutorStudentSubmissionController
);
router.post('/tutor/assignments/:assignmentId/auto-grade', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), triggerTutorAutoGradeController);
router.get('/tutor/assignments/:assignmentId/analytics', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), getTutorAssignmentAnalyticsController);

// Shared/core routes
router.post('/problems', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), zodValidator(createProblemSchema), createProblemController);
router.get('/problems/:id', isAuthenticated, getProblemController);
router.post('/ai/generate-problems', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), zodValidator(generateProblemsSchema), generateProblemsController);
router.get('/classes/:classId/students', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), getTeacherClassStudentsController);

export { router };
