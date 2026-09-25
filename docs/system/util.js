function serializeUserId(building, floor, room, userId) {
  return `${building.toString(9)}9${floor.toString(9)}9${room.toString(9)}9${userId.toString(9)}`;
}
function unserializeUserId(id) {
  const [building, floor, room, userId] = id
    .split("9")
    .map((n) => parseInt(n, 9));
  return { building, floor, room, userId };
}

/**
 * roomNumber...部屋番号
 * roomId...部屋ID
 * @param {string} roomNumber
 */
function splitRoomNumber(roomNumber) {
  const floorId = parseInt(roomNumber.slice(0, -2)) - 1;
  const roomId = parseInt(roomNumber.slice(-2)) - 1;
  if (Number.isNaN(floorId + roomId)) return "部屋番号が不正です。";
  return {
    floorId,
    roomId,
  };
}

/**
 * @param {number} floorId
 * @param {number} roomId
 */
function joinRoomNumber(floorId, roomId) {
  let str = "";
  str += floorId + 1;
  str += `${roomId + 1}`.padStart(2, "0");
  return str;
}

/**
 * @param {string} id
 * @param {string} label
 * @param {boolean} onNone? true: error, false:empty string
 * @return {string|{error:string}}
 */
function getInput(id, label, onNone) {
  const value = document.getElementById(id)?.value;
  if (!onNone) return value ?? "";
  if (!value) return { error: `「${label}」は必須項目ですが、未入力です。` };
  return value;
}
/**
 * @param {string[]} ids
 * @returns {{[id:string]:boolean}}
 */
function getCheckboxs(ids) {
  const obj = {};
  ids.forEach((id) => {
    obj[id] = document.getElementById(id)?.checked ?? false;
  });
  return obj;
}

/**
 * @param {string} path
 */
function getURL(path) {
  const url = document.URL;
  if (url.includes("localhost") || url.includes("127.0.0.1"))
    return `http://localhost:5500/docs/${path}`;
  return `https://tomahok4134.github.io/Hackathon-26/${path}`;
}
