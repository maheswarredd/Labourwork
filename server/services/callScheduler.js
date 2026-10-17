import Worker from "../models/Worker.js";
import CallRecord from "../models/CallRecord.js";

export async function runScheduledCollection(period) {
  const workers = await Worker.find({ active: true }).lean();

  for (const worker of workers) {
    // IMPORTANT:
    // This intentionally logs a pending outbound call instead of silently
    // pretending a real PSTN call was made.
    // Connect this function to your SIP provider's outbound call API.
    await CallRecord.create({
      workerId: worker._id,
      phone: worker.phone,
      direction: "OUTBOUND",
      status: "QUEUED",
      metadata: { collectionPeriod: period }
    });
  }

  console.log(`Queued ${workers.length} ${period} collection calls`);
}
