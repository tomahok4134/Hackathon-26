import * as fs from "fs/promises";
export function exists(path: string, inverse: boolean = false) {
  return fs.access(path).then(
    () => (inverse ? false : true),
    () => (inverse ? true : false),
  );
}

export function serializeUserId(
  building: number,
  floor: number,
  room: number,
  userId: number,
) {
  return `${building.toString(9)}9${floor.toString(9)}9${room.toString(9)}9${userId.toString(9)}`;
}

export function unserializeUserId(id: string) {
  const [building, floor, room, userId] = id
    .split("9")
    .map((n) => parseInt(n, 9));
  return { building, floor, room, userId };
}
