import * as fs from "fs/promises";
import { DATA_FOLDER } from "./config.js";

export interface GeneralInfo {
  buildings: { name: string; floors: number[] }[];
}

export async function getGeneralInfo(): Promise<GeneralInfo> {
  return JSON.parse(await fs.readFile(`${DATA_FOLDER}/index.json`, "utf8"));
}
