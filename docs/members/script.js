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
 * @param {{building:number,floor:number,room:number,userId:number}} userInfo
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
 * @param {{building:number,floor:number,room:number,userId:number}} userInfo
 */
function selectBuilding(floors, userInfo) {
  /**@type {HTMLFormElement} */
  const floorsEl = document.querySelector("#floors");
  floorsEl.innerHTML = "";
  const selects = floors.map((f, i) =>
    makeSelect("floor", `${i}`, `${i + 1}階`, userInfo && i === userInfo.floor),
  );
  floorsEl.append(...selects);
}

/**
 * @param {number} floor
 * @param {number} rooms
 * @param {{building:number,floor:number,room:number,userId:number}} userInfo
 */
function selectFloor(floor, rooms, userInfo) {
  /**@type {HTMLFormElement} */
  const roomsEl = document.querySelector("#rooms");
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
}

async function select(params) {}

(async () => {
  returnIfNotLogined();
  const general = await getGeneralInfo();
  const userInfo = unserializeUserId((await globalLoginData)[1].id);
  generateRoomSelect(general, userInfo);

  /**@type {HTMLFormElement} */
  const buildings = document.querySelector("#buildings");
  buildings.addEventListener("change", (ev) => {
    const select = getRadioValue("building");
    if (!select) return;
    selectBuilding(general.buildings[parseInt(select)].floors, {});
  });
  /**@type {HTMLFormElement} */
  const floors = document.querySelector("#floors");
  floors.addEventListener("change", (ev) => {
    const bIndex = getRadioValue("building");
    const fIndex = getRadioValue("floor");
    if (!bIndex || !fIndex) return;
    const floor = parseInt(fIndex);
    selectFloor(floor, general.buildings[parseInt(bIndex)].floors[floor], {});
  });
})();
