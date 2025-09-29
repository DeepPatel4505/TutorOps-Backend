import { router as authRouter} from "@api/auth/controller.js";
import express from "express";

const appRouter = express.Router();

appRouter.use("/auth", authRouter);

export default appRouter;