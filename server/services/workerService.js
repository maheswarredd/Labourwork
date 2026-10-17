import { v4 as uuidv4 } from "uuid";
import Worker from "../models/Worker.js";

export async function createWorker(data) {
  return Worker.create({
    workerId: data.workerId || `KW-${uuidv4().slice(0, 8).toUpperCase()}`,
    name: data.name,
    phone: data.phone,
    village: data.village || "",
    workType: data.workType || "",
    notes: data.notes || ""
  });
}
