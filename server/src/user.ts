import { DATA_FOLDER } from "./config.js";
import { login } from "./login.js";
import { getRoom } from "./room.js";
import { exists } from "./util.js";
import * as fs from "fs/promises";

export type User = {
  name: string;
  gender: string;
  birth: string;
  relationship: string;
  comment: string;
  privateInfos: { gender: boolean; birth: boolean; relationship: boolean };
};

export async function getUser(
  buildingId: number,
  floorId: number,
  roomId: number,
  userId: number,
): Promise<User | number> {
  const room = await getRoom(buildingId, floorId, roomId);
  if (typeof room === "number") return room;
  if (!room.users[userId]) return 404;

  return room.users[userId];
}

export async function modifyUser(
  buildingId: number,
  floorId: number,
  roomId: number,
  userId: number,
  user: User,
) {
  const room = await getRoom(buildingId, floorId, roomId);
  if (typeof room === "number") return room;

  let path = `${DATA_FOLDER}/building/${buildingId}`;
  if (await exists(path, true)) await fs.mkdir(path);
  path += `/${floorId}`;
  if (await exists(path, true)) await fs.mkdir(path);
  path += `/${roomId}.json`;

  const res = { new: true, index: room.users.length };
  if (room.users[userId]) {
    room.users[userId] = user;
    res.new = false;
  } else {
    room.users.push(user);
  }
  await fs.writeFile(path, JSON.stringify(room));

  return res;
}

export async function newUser(
  buildingId: number,
  floorId: number,
  roomId: number,
  user: User,
) {
  const res = await modifyUser(buildingId, floorId, roomId, NaN, user);
  if (typeof res === "number") return res;
  const logined = await login(
    buildingId,
    floorId,
    roomId,
    res.index,
    user.birth,
  );
  if (typeof logined === "number") return logined;
  return {
    index: res.index,
    uuid: logined.uuid,
  };
}
