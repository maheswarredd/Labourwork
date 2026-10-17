import { Router } from "express";
import { inboundWebhook, listCalls, turn } from "../controllers/callController.js";

const router = Router();
router.post("/inbound", inboundWebhook);
router.post("/turn", turn);
router.get("/", listCalls);
export default router;
