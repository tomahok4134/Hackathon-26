/**
 *
 * @param {string} category
 * @param {string} value
 * @param {string} label
 */
function makeSelect(category, value, label, isSelected = false) {
  const labelEl = document.createElement("label");
  labelEl.className = "radio-button";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = category;
  input.value = value;
  input.checked = isSelected;
  const span = document.createElement("span");
  span.className = "radio-label";
  span.innerText = label;
  labelEl.append(input, span);

  return labelEl;
}

/**
 * @param {GeneralInfo} general
 * @param {{building:number,floor:number,room:number,userId:number}|undefined} userInfo
 */
function generateRoomSelect(general, userInfo = null) {
  /**@type {HTMLFormElement} */
  const buildings = document.querySelector("#buildings");
  general.buildings.forEach((v, i) => {
    buildings.append(
      makeSelect(
        "building",
        "" + i,
        v.name,
        userInfo && i === userInfo.building,
      ),
    );
  });

  if (userInfo && !Number.isNaN(userInfo.building)) {
    selectBuilding(general.buildings[userInfo.building].floors, userInfo);
  }
}

/**
 * @param {number[]} floors
 * @param {{building:number,floor:number,room:number,userId:number}|undefined} userInfo
 */
function selectBuilding(floors, userInfo) {
  /**@type {HTMLFormElement} */
  const floorsEl = document.querySelector("#floors");
  document.querySelector("#result").style.display = "none";
  floorsEl.innerHTML = "";
  const selects = floors.map((f, i) =>
    makeSelect("floor", `${i}`, `${i + 1}階`, userInfo && i === userInfo.floor),
  );
  if (userInfo) {
    selectFloor(userInfo.floor, floors[userInfo.floor], userInfo);
  }
  floorsEl.append(...selects);
}

/**
 * @param {number} floor
 * @param {number} rooms
 * @param {{building:number,floor:number,room:number,userId:number}|undefined} userInfo
 */
function selectFloor(floor, rooms, userInfo) {
  /**@type {HTMLFormElement} */
  const roomsEl = document.querySelector("#rooms");
  document.querySelector("#result").style.display = "none";
  roomsEl.innerHTML = "";
  for (let i = 0; i < rooms; i++) {
    const roomName = joinRoomNumber(floor, i);
    const sel = makeSelect(
      "room",
      `${i}`,
      roomName,
      userInfo && i === userInfo.room,
    );
    roomsEl.append(sel);
  }
  if (userInfo) {
    selectRoom(userInfo.building, userInfo.floor, userInfo.room);
  }
}

/**
 * @param {User} user
 */
function makeUser(user) {
  const el = document.createElement("div");
  el.className = "user";

  const relation = document.createElement("div");
  relation.className = "u-relation";
  if (user.privateInfos.relationship)
    relation.innerText = "世帯主との関係: 非公開";
  else if (user.relationship === "世帯主") relation.innerText = "部屋の世帯主";
  else relation.innerText = `世帯主との関係: ${user.relationship}`;
  const title = document.createElement("div");
  title.className = "u-title";
  if (user.privateInfos.name) title.innerText = "名前非公開";
  else title.innerText = user.name;
  const gender = document.createElement("span");
  gender.className = "u-gender";
  if (user.privateInfos.gender) gender.innerText = "性別非公開";
  else
    switch (user.gender) {
      case "male":
        gender.innerText = "男性";
        break;
      case "female":
        gender.innerText = "女性";
        break;
      default:
        gender.innerText = "その他の性別";
        break;
    }
  const birth = document.createElement("span");
  birth.className = "u-birth";
  if (user.privateInfos.birth) birth.innerText = "生年月日非公開";
  else birth.innerText = "誕生日: " + user.birth.replaceAll("-", "/");
  const comment = document.createElement("div");
  comment.className = "u-comment";
  if (user.comment.length === 0) birth.innerText = "コメントなし";
  else comment.innerText = user.comment;

  const adminEdit = document.createElement("button");
  adminEdit.className = "u-admin admin-only";
  adminEdit.innerText = "編集(管理)";

  const adminDel = document.createElement("button");
  adminDel.className = "u-del admin-only";
  adminDel.innerText = "削除(管理)";

  const info = document.createElement("div");
  info.className = "u-info";
  info.append(birth, gender);

  el.append(relation, title, info, comment, adminEdit, adminDel);
  return el;
}

/**
 *
 * @param {number} building
 * @param {number} floor
 * @param {number} room
 */
async function selectRoom(building, floor, room) {
  const res = await fetch(`${API_URL}/db/${building}/${floor}/${room}`);
  if (!res.ok) {
    showToast(`データ取得に失敗しました: ${res.status}`);
  }
  const data = await res.json();
  document.querySelector("#result").style.display = "block";

  const result = document.querySelector("#result");
  result.innerHTML = "";
  const usersEl = data.users.map((u) => makeUser(u));
  result.append(...usersEl);
}

(async () => {
  returnIfNotLogined();
  const general = await getGeneralInfo();
  const idQuery = new URL(location).searchParams.get("id");
  const userInfo = idQuery
    ? unserializeUserId(idQuery)
    : unserializeUserId((await globalLoginData)[1].id);
  generateRoomSelect(general, userInfo);

  /**@type {HTMLFormElement} */
  const buildings = document.querySelector("#buildings");
  buildings.addEventListener("change", (ev) => {
    const select = getRadioValue("building");
    if (!select) return;
    selectBuilding(general.buildings[parseInt(select)].floors);
  });
  /**@type {HTMLFormElement} */
  const floors = document.querySelector("#floors");
  floors.addEventListener("change", (ev) => {
    const bIndex = getRadioValue("building");
    const fIndex = getRadioValue("floor");
    if (!bIndex || !fIndex) return;
    const floor = parseInt(fIndex);
    selectFloor(floor, general.buildings[parseInt(bIndex)].floors[floor]);
  });
  /**@type {HTMLFormElement} */
  const rooms = document.querySelector("#rooms");
  rooms.addEventListener("change", (ev) => {
    const bIndex = getRadioValue("building");
    const fIndex = getRadioValue("floor");
    const rIndex = getRadioValue("room");
    if (!bIndex || !fIndex || !rIndex) return;
    selectRoom(parseInt(bIndex), parseInt(fIndex), parseInt(rIndex));
  });
})();
