import { textToSpeech, transcribeAudio } from "../services/sarvamService.js";

export async function tts(req, res) {
  const audio = await textToSpeech(req.body.text || "");
  res.setHeader("Content-Type", "audio/wav");
  res.send(audio);
}

export async function stt(req, res) {
  if (!req.file) return res.status(400).json({ message: "audio file required" });
  const result = await transcribeAudio(req.file.buffer, req.file.originalname);
  res.json(result);
}
