import DailyWorkRecord from "../models/DailyWorkRecord.js";
import { dateKey } from "../services/dateService.js";

export async function saveDailyRecord(req, res) {
  const {
    workerId, morningEarning = 0, eveningEarning = 0,
    status = "WORKED", workType = "", reason = "", confirmed = true
  } = req.body;

  const totalEarning = status === "WORKED"
    ? Number(morningEarning) + Number(eveningEarning)
    : 0;

  const record = await DailyWorkRecord.findOneAndUpdate(
    { workerId, dateKey: dateKey() },
    { $set: { morningEarning, eveningEarning, totalEarning, status, workType, reason, confirmed, source: "WEB" } },
    { upsert: true, new: true }
  );

  res.json(record);
}

export async function dashboardTotals(req, res) {
  const rows = await DailyWorkRecord.find({}).lean();
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const today = dateKey();
  const monthPrefix = `${year}-${month}`;
  const yearPrefix = `${year}-`;

  const total = rows.reduce((s, r) => s + (r.totalEarning || 0), 0);
  const todayRows = rows.filter(r => r.dateKey === today);
  const monthRows = rows.filter(r => r.dateKey.startsWith(monthPrefix));
  const yearRows = rows.filter(r => r.dateKey.startsWith(yearPrefix));

  res.json({
    todayEarning: todayRows.reduce((s, r) => s + r.totalEarning, 0),
    monthEarning: monthRows.reduce((s, r) => s + r.totalEarning, 0),
    yearEarning: yearRows.reduce((s, r) => s + r.totalEarning, 0),
    allTimeEarning: total,
    workingToday: todayRows.filter(r => r.status === "WORKED").length,
    holidayToday: todayRows.filter(r => r.status === "HOLIDAY").length,
    ownWorkToday: todayRows.filter(r => r.status === "OWN_WORK").length
  });
}
