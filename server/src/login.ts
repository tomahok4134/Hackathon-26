import * as fs from "fs/promises";
import { DATA_FOLDER } from "./config.js";
import { getRoom } from "./room.js";
import { serializeUserId, unserializeUserId } from "./util.js";
import { getUser, User } from "./user.js";
const SESSIONS_PATH = `${DATA_FOLDER}/sessions.json`;
type Sessions = { uuid: string; expire: string; id: string }[];
export async function login(
  buildingId: number,
  floorId: number,
  roomId: number,
  userId: number,
  birth: string,
) {
  const user = await getUser(buildingId, floorId, roomId, userId);
  if (user === 404) return 401;
  if (typeof user === "number") return user;
  if (user.birth !== birth) return 401;
  const uuid = crypto.randomUUID();
  const now = new Date();

  const thisUserId = serializeUserId(buildingId, floorId, roomId, userId);

  const data: Sessions = JSON.parse(await fs.readFile(SESSIONS_PATH, "utf8"));
  data.filter(({ id }) => {
    if (id === thisUserId) return false;
    return true;
  });
  now.setDate(now.getDate() + 7);
  data.push({ uuid, expire: now.toISOString(), id: thisUserId });
  await fs.writeFile(SESSIONS_PATH, JSON.stringify(data));

  return {
    uuid,
    userId: thisUserId,
  };
}

export async function logining(
  reqUUID: string,
): Promise<"uuid-notfound" | "expired" | "user-error" | User> {
  const data: Sessions = JSON.parse(await fs.readFile(SESSIONS_PATH, "utf8"));
  const now = new Date();
  for (const { uuid, expire, id } of data) {
    if (uuid !== reqUUID) continue;
    if (new Date(expire) < now) return "expired";
    const { building, floor, room, userId } = unserializeUserId(id);
    const result = await getUser(building, floor, room, userId);
    if (typeof result === "number") return "user-error";
    return result;
  }
  return "uuid-notfound";
}
