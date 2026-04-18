import { Router } from 'express';
import isAuthenticated from '#src/middlewares/isAuthenticated.js';
import roleCheck from '#src/middlewares/roleCheck.js';
import { listUsersController } from './controllers/user.controller.js';

const router = Router();

router.get('/users', isAuthenticated, roleCheck('TEACHER', 'ADMIN'), listUsersController);

export { router };
