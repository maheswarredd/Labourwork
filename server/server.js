import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";

import workerRoutes from "./routes/workerRoutes.js";
import earningRoutes from "./routes/earningRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { runScheduledCollection } from "./services/callScheduler.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "kulipani-ai-server", time: new Date().toISOString() });
});

app.use("/api/workers", workerRoutes);
app.use("/api/earnings", earningRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/ai", aiRoutes);

const port = Number(process.env.PORT || 5000);

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  if (process.env.ENABLE_CALL_SCHEDULER === "true") {
    cron.schedule(
      process.env.MORNING_CALL_CRON || "0 8 * * *",
      () => runScheduledCollection("morning"),
      { timezone: process.env.TIMEZONE || "Asia/Kolkata" }
    );
    cron.schedule(
      process.env.EVENING_CALL_CRON || "0 19 * * *",
      () => runScheduledCollection("evening"),
      { timezone: process.env.TIMEZONE || "Asia/Kolkata" }
    );
    console.log("Call scheduler enabled");
  }

  app.listen(port, () => console.log(`Server running on :${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
