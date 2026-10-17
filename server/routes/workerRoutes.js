import { Router } from "express";
import { addWorker, getWorker, listWorkers } from "../controllers/workerController.js";

const router = Router();
router.get("/", listWorkers);
router.post("/", addWorker);
router.get("/:id", getWorker);
export default router;
