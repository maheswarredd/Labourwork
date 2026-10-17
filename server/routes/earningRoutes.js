import { Router } from "express";
import { dashboardTotals, saveDailyRecord } from "../controllers/earningController.js";

const router = Router();
router.get("/dashboard", dashboardTotals);
router.post("/daily", saveDailyRecord);
export default router;
