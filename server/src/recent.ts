import * as fs from "fs/promises";
import { DATA_FOLDER } from "./config.js";
export interface BaseRecentChange {
  type: string;
  targetUserId?: string;
  targetUserName: string;
  date: string;
}

export interface NewRecentChange extends BaseRecentChange {
  type: "new";
  targetUserId: string;
}

export interface LeaveRecentChange extends BaseRecentChange {
  type: "leave";
  targetUserId?: never;
}

export interface InfoModifiedRecentChange extends BaseRecentChange {
  type: "modify";
  targetUserId: string;
}

export type RecentChange =
  | NewRecentChange
  | LeaveRecentChange
  | InfoModifiedRecentChange;

export async function addRecentChange(
  data: Pick<RecentChange, "targetUserId" | "targetUserName" | "type">,
) {
  const change: BaseRecentChange = {
    ...data,
    date: new Date().toISOString(),
  };

  const recents = await getRecentChange();
  recents.unshift(change);
  await fs.writeFile(`${DATA_FOLDER}/recent.json`, JSON.stringify(recents));
}

export async function getRecentChange(limit: number = Infinity) {
  const recents: BaseRecentChange[] = JSON.parse(
    await fs.readFile(`${DATA_FOLDER}/recent.json`, "utf8"),
  );
  const deleteFrom = new Date();
  deleteFrom.setDate(deleteFrom.getDate() - 7);
  const deleteFromValue = deleteFrom.valueOf();
  recents.filter((r) => new Date(r.date).valueOf() > deleteFromValue);

  return recents;
}
