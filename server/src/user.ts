import { DATA_FOLDER } from "./config.js";
import { onUserModified } from "./events.js";
import { login } from "./login.js";
import { getRoom, saveRoom } from "./room.js";
import { exists, serializeUserId, unserializeUserId } from "./util.js";
import * as fs from "fs/promises";

export type User = {
  id: string;
  name: string;
  gender: string;
  birth: string;
  relationship: string;
  comment: string;
  privateInfos: {
    name: boolean;
    gender: boolean;
    birth: boolean;
    relationship: boolean;
  };
  password: string;
};

export async function getUser(
  id: string,
  arg1: null,
  arg2: null,
  arg3: null,
  needPassword?: boolean,
): Promise<User | number>;
export async function getUser(
  buildingId: number,
  floorId: number,
  roomId: number,
  userId: number,
  needPassword?: boolean,
): Promise<User | number>;
export async function getUser(
  buildingId: number | string,
  floorId: number | null,
  roomId: number | null,
  userId: number | null,
  needPassword: boolean = false,
): Promise<User | number> {
  if (typeof buildingId === "string") {
    const { building, floor, room, index } = unserializeUserId(buildingId);
    buildingId = building;
    floorId = floor;
    roomId = room;
    userId = index;
  }
  if (floorId === null || roomId === null || userId === null) return 500;
  const room = await getRoom(buildingId, floorId, roomId, needPassword);
  if (typeof room === "number") return room;
  if (!room.users[userId]) return 404;

  return room.users[userId];
}

export async function modifyUser(user: User, isNew: boolean = false) {
  let { building, floor, room, index } = unserializeUserId(user.id);
  if (isNew) index = Infinity;

  const roomData = await getRoom(building, floor, room);
  if (typeof roomData === "number") return room;

  const res = { new: true, index: roomData.users.length };

  let path = `${DATA_FOLDER}/building/${building}`;
  if (await exists(path, true)) await fs.mkdir(path);
  path += `/${floor}`;
  if (await exists(path, true)) await fs.mkdir(path);
  path += `/${room}.json`;

  if (roomData.users[index]) {
    await onUserModified(roomData.users[index], user);
    roomData.users[index] = user;
    res.index = index;
    res.new = false;
  } else {
    user.id = serializeUserId(building, floor, room, res.index);
    await onUserModified(user, null);
    roomData.users.push(user);
  }

  await fs.writeFile(path, JSON.stringify(roomData));

  return res;
}

export async function newUser(
  buildingId: number,
  floorId: number,
  roomId: number,
  user: User,
) {
  user.id = serializeUserId(buildingId, floorId, roomId, 0);
  const res = await modifyUser(user, true);
  if (typeof res === "number") return res;
  const id = serializeUserId(buildingId, floorId, roomId, res.index);
  const logined = await login(id, user.password);
  if (typeof logined === "number") return logined;
  return {
    index: res.index,
    uuid: logined.uuid,
    id,
  };
}

export async function delUser(userId: string, password: string) {
  const { building, floor, room } = unserializeUserId(userId);
  const roomData = await getRoom(building, floor, room, true);
  if (typeof roomData === "number") return room;
  const beforeLength = roomData.users.length;
  roomData.users.filter((u) => {
    if (u.id !== userId) return true;
    if (u.password === password) return false;
    return true;
  });
  await saveRoom(roomData);
  return beforeLength === roomData.users.length ? 403 : 204;
}
