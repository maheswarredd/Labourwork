import { Router } from "express";
import multer from "multer";
import { stt, tts } from "../controllers/aiController.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const router = Router();

router.post("/tts", tts);
router.post("/stt", upload.single("audio"), stt);

export default router;
