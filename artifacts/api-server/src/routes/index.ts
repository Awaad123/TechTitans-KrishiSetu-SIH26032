import { Router, type IRouter } from "express";
import healthRouter from "./health";
import krishisetuRouter from "./krishisetu";

const router: IRouter = Router();

router.use(healthRouter);
router.use(krishisetuRouter);

export default router;
