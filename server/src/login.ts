import * as fs from "fs/promises";
import { DATA_FOLDER } from "./config.js";
import { getRoom } from "./room.js";
import { serializeUserId, unserializeUserId } from "./util.js";
import { getUser, User } from "./user.js";
const SESSIONS_PATH = `${DATA_FOLDER}/sessions.json`;
type Sessions = { uuid: string; expire: string; id: string }[];
export interface Admin {
  name: string;
  id: string;
  pass: string;
}
export async function login(id: string, pass: string) {
  if (id.startsWith("admin-")) {
    const result = await findAdmin(id.substring(6));
    if (!result || result.pass !== pass) return 401;
  } else {
    const { building, floor, room, userId } = unserializeUserId(id);
    const user = await getUser(building, floor, room, userId, true);
    if (user === 404) return 401;
    if (typeof user === "number") return user;
    if (user.password !== pass) return 401;
  }
  const uuid = crypto.randomUUID();
  const now = new Date();

  const data: Sessions = JSON.parse(await fs.readFile(SESSIONS_PATH, "utf8"));
  now.setDate(now.getDate() + 7);
  data.push({ uuid, expire: now.toISOString(), id });
  await fs.writeFile(SESSIONS_PATH, JSON.stringify(data));

  return {
    uuid,
  };
}

export async function findAdmin(id: string): Promise<Admin | undefined> {
  const admins: { name: string; id: string; pass: string }[] = JSON.parse(
    await fs.readFile(`${DATA_FOLDER}/admins.json`, "utf8"),
  );
  return admins.find((a) => a.id === id);
}

export async function logining(
  reqUUID: string,
): Promise<"uuid-notfound" | "expired" | "user-error" | User | Admin> {
  const data: Sessions = JSON.parse(await fs.readFile(SESSIONS_PATH, "utf8"));
  const now = new Date();
  for (const { uuid, expire, id } of data) {
    if (uuid !== reqUUID) continue;
    if (new Date(expire) < now) return "expired";
    if (id.startsWith("admin-"))
      return (await findAdmin(id.substring(6))) ?? "user-error";
    const { building, floor, room, userId } = unserializeUserId(id);
    const result = await getUser(building, floor, room, userId);
    if (typeof result === "number") return "user-error";
    return result;
  }
  return "uuid-notfound";
}
