import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import walletRouter from "./wallet.js";
import activityRouter from "./activity.js";
import rewardsRouter from "./rewards.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/wallet", walletRouter);
router.use("/activity", activityRouter);
router.use("/rewards", rewardsRouter);

export default router;
