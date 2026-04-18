import { authRouter } from "#api/auth/index.js";
import { assignmentsRouter } from '#api/assignments/index.js';
import { classesRouter } from '#api/classes/index.js';
import { systemRouter } from "#api/system/index.js";
import { usersRouter } from '#api/users/index.js';
import express from "express";


const appRouter = express.Router();

appRouter.use("/auth", authRouter);
appRouter.use("/system", systemRouter);
appRouter.use('/', usersRouter);
appRouter.use('/', classesRouter);
appRouter.use('/', assignmentsRouter);

export default appRouter;