import DailyWorkRecord from "../models/DailyWorkRecord.js";

export async function getWorkerTotals(workerId) {
  const records = await DailyWorkRecord.find({ workerId }).lean();
  const total = records.reduce((sum, r) => sum + (r.totalEarning || 0), 0);
  const workedDays = records.filter(r => r.status === "WORKED").length;
  const holidays = records.filter(r => r.status === "HOLIDAY").length;
  const ownWorkDays = records.filter(r => r.status === "OWN_WORK").length;
  return { total, workedDays, holidays, ownWorkDays };
}

export async function aggregatePeriod({ workerId, start, end }) {
  const rows = await DailyWorkRecord.find({
    workerId,
    dateKey: { $gte: start, $lt: end }
  }).lean();

  return {
    earning: rows.reduce((s, r) => s + (r.totalEarning || 0), 0),
    workedDays: rows.filter(r => r.status === "WORKED").length,
    holidayDays: rows.filter(r => r.status === "HOLIDAY").length,
    ownWorkDays: rows.filter(r => r.status === "OWN_WORK").length,
    absentDays: rows.filter(r => r.status === "ABSENT").length,
    records: rows
  };
}
