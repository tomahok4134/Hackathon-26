import { DATA_FOLDER } from "./config.js";
import { getGeneralInfo } from "./general.js";
import { login } from "./login.js";
import { User } from "./user.js";
import { exists } from "./util.js";
import * as fs from "fs/promises";

export interface Room {
  buildingName: string;
  floor: number;
  room: number;
  users: User[];
}

export async function getRoom(
  buildingId: number,
  floorId: number,
  roomId: number,
): Promise<number | Room> {
  const { buildings } = await getGeneralInfo();
  const path = `${DATA_FOLDER}/building/${buildingId}/${floorId}/${roomId}.json`;

  if (
    roomId < 0 ||
    !buildings[buildingId] ||
    !buildings[buildingId].floors[floorId] ||
    buildings[buildingId].floors[floorId] - 1 < roomId
  ) {
    return 404;
  }

  if (await exists(path, true))
    return {
      buildingName: buildings[buildingId].name,
      floor: floorId,
      room: roomId,
      users: [],
    };

  return JSON.parse(await fs.readFile(path, "utf8"));
}

export async function saveRoom(room: Room) {
  const keys = await roomToKeys(room).catch(() => false);
  if (typeof keys === "boolean") return keys;
  const path = `${DATA_FOLDER}/building/${keys.join("/")}.json`;
  await fs.writeFile(path, JSON.stringify(room));
  return true;
}

export async function roomToKeys(
  room: Room,
): Promise<[number, number, number]> {
  const { buildings } = await getGeneralInfo();
  const buildingId = buildings.findIndex(
    ({ name }) => name === room.buildingName,
  );
  if (buildingId === -1) throw new Error("building not found");
  return [buildingId, room.floor, room.room];
}
