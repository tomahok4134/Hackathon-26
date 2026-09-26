/**
 *
 * @param {string} category
 * @param {string} value
 * @param {string} label
 */
function makeSelect(category, value, label) {
  const labelEl = document.createElement("label");
  labelEl.className = "radio-button";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = category;
  input.value = value;
  const span = document.createElement("span");
  span.className = "radio-label";
  span.innerText = label;
  labelEl.append(input, span);

  return labelEl;
}

async function generateRoomSelect() {
  const general = await getGeneralInfo();
  general.buildings.forEach(() => {});
}

async function select(params) {}
