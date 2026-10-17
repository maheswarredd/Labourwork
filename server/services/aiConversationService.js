import Worker from "../models/Worker.js";
import DailyWorkRecord from "../models/DailyWorkRecord.js";
import { dateKey } from "./dateService.js";

function extractAmount(text = "") {
  const match = text.replace(/,/g, "").match(/(?:₹|rs\.?|rupees?|rupayalu?)?\s*(\d{1,6})/i);
  return match ? Number(match[1]) : null;
}

export async function identifyWorkerByPhone(phone) {
  if (!phone) return null;
  const normalized = String(phone).replace(/\D/g, "").slice(-10);
  return Worker.findOne({ phone: { $regex: normalized + "$" } });
}

export async function processTurn({ worker, text, state = {} }) {
  const lower = text.toLowerCase();
  const next = { ...state };

  if (!worker) {
    return { reply: "Mee peru cheppandi. Mee peru database lo register chestham.", state: next, action: "NEED_WORKER" };
  }

  if (!state.stage) {
    next.stage = "ASK_STATUS";
    return {
      reply: `Namaskaram ${worker.name} garu. Eeroju kooli pani ki vellara? Avunu leka kaadu ani cheppandi.`,
      state: next
    };
  }

  if (state.stage === "ASK_STATUS") {
    if (/(avunu|yes|vellanu|pani chesanu)/i.test(lower)) {
      next.stage = "ASK_WORK_TYPE";
      return { reply: "Eeroju ye pani chesaru?", state: next };
    }
    if (/(holiday|selavu|leave|own|sonta|maa polam|polam)/i.test(lower)) {
      next.stage = "ASK_NON_WORK_REASON";
      return { reply: "Eeroju selava? Leka mee sonta pani chesara?", state: next };
    }
    return { reply: "Dayachesi avunu leka kaadu ani cheppandi.", state: next };
  }

  if (state.stage === "ASK_WORK_TYPE") {
    next.workType = text;
    next.stage = "ASK_MORNING";
    return { reply: "Morning entha kooli vachindi? Rupayallo cheppandi.", state: next };
  }

  if (state.stage === "ASK_MORNING") {
    const amount = extractAmount(text);
    if (amount == null) return { reply: "Morning amount rupayallo cheppandi. Udaharanaki 400.", state: next };
    next.morningEarning = amount;
    next.stage = "ASK_EVENING";
    return { reply: "Evening entha kooli vachindi?", state: next };
  }

  if (state.stage === "ASK_EVENING") {
    const amount = extractAmount(text);
    if (amount == null) return { reply: "Evening amount rupayallo cheppandi.", state: next };
    next.eveningEarning = amount;
    next.totalEarning = next.morningEarning + amount;
    next.stage = "CONFIRM";
    return {
      reply: `Ramesh kaadu, ${worker.name} garu: morning ${next.morningEarning}, evening ${next.eveningEarning}, total ${next.totalEarning} rupayalu. Correct aa?`,
      state: next
    };
  }

  if (state.stage === "ASK_NON_WORK_REASON") {
    const status = /(own|sonta|polam|maa pani)/i.test(lower) ? "OWN_WORK" : "HOLIDAY";
    next.status = status;
    next.stage = "CONFIRM_NON_WORK";
    return {
      reply: status === "OWN_WORK"
        ? "Sare. Eeroju mee sonta pani ani record chesthanu. Earning zero. Correct aa?"
        : "Sare. Eeroju holiday ani record chesthanu. Earning zero. Correct aa?",
      state: next
    };
  }

  if (state.stage === "CONFIRM") {
    if (/(avunu|correct|yes|sare)/i.test(lower)) {
      const record = await DailyWorkRecord.findOneAndUpdate(
        { workerId: worker._id, dateKey: dateKey() },
        {
          $set: {
            morningEarning: next.morningEarning,
            eveningEarning: next.eveningEarning,
            totalEarning: next.totalEarning,
            status: "WORKED",
            workType: next.workType || worker.workType,
            confirmed: true,
            source: "AI_CALL",
            rawTranscript: ""
          }
        },
        { upsert: true, new: true }
      );
      return { reply: `Sare ${worker.name} garu. Eeroju ${record.totalEarning} rupayalu save ayyayi. Dhanyavadalu.`, state: next, action: "SAVED" };
    }
    next.stage = "ASK_MORNING";
    return { reply: "Sare. Malli morning earning cheppandi.", state: next };
  }

  if (state.stage === "CONFIRM_NON_WORK") {
    if (/(avunu|correct|yes|sare)/i.test(lower)) {
      const status = next.status || "HOLIDAY";
      await DailyWorkRecord.findOneAndUpdate(
        { workerId: worker._id, dateKey: dateKey() },
        {
          $set: {
            morningEarning: 0,
            eveningEarning: 0,
            totalEarning: 0,
            status,
            confirmed: true,
            source: "AI_CALL"
          }
        },
        { upsert: true, new: true }
      );
      return { reply: `Sare ${worker.name} garu. Record save chesanu.`, state: next, action: "SAVED" };
    }
    return { reply: "Sare. Malli cheppandi: holiday aa, sonta pani aa?", state: next };
  }

  return { reply: "Mee information ardham kaaledu. Malli cheppandi.", state: next };
}
