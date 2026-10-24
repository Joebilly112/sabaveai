import { Router, type IRouter } from "express";
import businessesRouter from "./businesses";
import forecastRouter from "./forecast";
import healthRouter from "./health";
import triggerRouter from "./trigger";

const router: IRouter = Router();

router.use(healthRouter);
router.use(businessesRouter);
router.use(forecastRouter);
router.use(triggerRouter);

export default router;
