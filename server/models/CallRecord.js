import mongoose from "mongoose";

const callRecordSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", index: true },
  phone: { type: String, index: true },
  direction: { type: String, enum: ["INBOUND", "OUTBOUND"], required: true },
  providerCallId: { type: String, index: true },
  status: { type: String, default: "STARTED" },
  durationSeconds: { type: Number, default: 0 },
  transcript: { type: String, default: "" },
  collected: { type: Boolean, default: false },
  confirmed: { type: Boolean, default: false },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model("CallRecord", callRecordSchema);
