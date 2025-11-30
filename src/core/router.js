import { authRouter } from "#api/auth/index.js";
import { systemRouter } from "#api/system/index.js";
import express from "express";


const appRouter = express.Router();

appRouter.use("/auth", authRouter);
appRouter.use("/system", systemRouter);

export default appRouter;