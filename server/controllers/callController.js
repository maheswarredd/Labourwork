import CallRecord from "../models/CallRecord.js";
import { identifyWorkerByPhone, processTurn } from "../services/aiConversationService.js";

const sessions = new Map();

export async function inboundWebhook(req, res) {
  const phone = req.body.phone || req.body.from || req.body.caller;
  const worker = await identifyWorkerByPhone(phone);

  const call = await CallRecord.create({
    workerId: worker?._id,
    phone,
    direction: "INBOUND",
    providerCallId: req.body.callId || req.body.call_id,
    status: "ANSWERED"
  });

  sessions.set(call._id.toString(), { worker, state: {} });

  res.json({
    ok: true,
    callId: call._id,
    worker: worker ? { id: worker._id, name: worker.name } : null,
    greeting: worker
      ? `Namaskaram ${worker.name} garu. Mee kosam AI assistant ready ga undi.`
      : "Namaskaram. Mee peru cheppandi."
  });
}

export async function turn(req, res) {
  const session = sessions.get(String(req.body.callId));
  if (!session) return res.status(404).json({ message: "Call session not found" });

  const result = await processTurn({
    worker: session.worker,
    text: req.body.text || "",
    state: session.state
  });

  session.state = result.state;

  if (result.action === "SAVED") {
    await CallRecord.findByIdAndUpdate(req.body.callId, {
      collected: true,
      confirmed: true,
      $set: { status: "COMPLETED" }
    });
  }

  res.json(result);
}

export async function listCalls(req, res) {
  const rows = await CallRecord.find({}).populate("workerId", "name phone").sort({ createdAt: -1 }).limit(500).lean();
  res.json(rows);
}
