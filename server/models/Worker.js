import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
  workerId: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, index: true },
  village: { type: String, default: "" },
  workType: { type: String, default: "" },
  active: { type: Boolean, default: true },
  notes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Worker", workerSchema);
