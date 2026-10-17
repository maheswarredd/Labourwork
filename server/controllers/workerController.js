import Worker from "../models/Worker.js";
import DailyWorkRecord from "../models/DailyWorkRecord.js";
import { createWorker } from "../services/workerService.js";
import { getWorkerTotals } from "../services/earningService.js";

export async function listWorkers(req, res) {
  const workers = await Worker.find({}).sort({ name: 1 }).lean();
  const rows = await Promise.all(workers.map(async w => ({
    ...w,
    ...(await getWorkerTotals(w._id))
  })));
  res.json(rows);
}

export async function addWorker(req, res) {
  const worker = await createWorker(req.body);
  res.status(201).json(worker);
}

export async function getWorker(req, res) {
  const worker = await Worker.findById(req.params.id).lean();
  if (!worker) return res.status(404).json({ message: "Worker not found" });
  const records = await DailyWorkRecord.find({ workerId: worker._id }).sort({ dateKey: -1 }).lean();
  const totals = await getWorkerTotals(worker._id);
  res.json({ worker, totals, records });
}
