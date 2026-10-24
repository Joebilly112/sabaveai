import { Router, type IRouter } from "express";
import businessesRouter from "./businesses";
import forecastRouter from "./forecast";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(businessesRouter);
router.use(forecastRouter);

export default router;
