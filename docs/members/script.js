/**
 *
 * @param {string} category
 * @param {string} value
 * @param {string} label
 */
function makeSelect(category, value, label) {
  /*  <label class="radio-button">
          <input type="radio" name="sample" value="1" checked>
          <span class="radio-label">選択肢 1</span>
        </label>
*/
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
