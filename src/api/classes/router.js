import { Router } from 'express';
import isAuthenticated from '#src/middlewares/isAuthenticated.js';
import roleCheck from '#src/middlewares/roleCheck.js';
import zodValidator from '#src/middlewares/zodValidator.js';
import { createClassSchema } from './dtos/createClass.dto.js';
import { enrollStudentSchema } from './dtos/enrollStudent.dto.js';
import {
    createClassController,
    enrollStudentController,
    listClassesController,
    listClassStudentsController,
} from './controllers/class.controller.js';

const router = Router();

router.post('/tutor/classes', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), zodValidator(createClassSchema), createClassController);
router.get('/tutor/classes', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), listClassesController);
router.post(
    '/tutor/classes/:classId/enroll',
    isAuthenticated,
    roleCheck('TEACHER', 'ADMIN'),
    zodValidator(enrollStudentSchema),
    enrollStudentController
);
router.post('/classes/:classId/enroll', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), zodValidator(enrollStudentSchema), enrollStudentController);
router.get('/tutor/classes/:classId/students', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), listClassStudentsController);

export { router };
