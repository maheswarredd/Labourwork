import mongoose from "mongoose";

const dailyWorkRecordSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true, index: true },
  dateKey: { type: String, required: true, index: true },
  morningEarning: { type: Number, default: 0, min: 0 },
  eveningEarning: { type: Number, default: 0, min: 0 },
  totalEarning: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ["WORKED", "HOLIDAY", "OWN_WORK", "ABSENT", "UNKNOWN"],
    default: "UNKNOWN"
  },
  workType: { type: String, default: "" },
  reason: { type: String, default: "" },
  confirmed: { type: Boolean, default: false },
  source: { type: String, enum: ["AI_CALL", "WEB", "ADMIN"], default: "AI_CALL" },
  rawTranscript: { type: String, default: "" }
}, { timestamps: true });

dailyWorkRecordSchema.index({ workerId: 1, dateKey: 1 }, { unique: true });

export default mongoose.model("DailyWorkRecord", dailyWorkRecordSchema);
