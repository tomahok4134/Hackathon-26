async function signin() {
  /**@type {string[]} */
  const errors = [];

  const form = {
    userid: getInput("signin-userid", "ユーザID", true),
    birth: getInput("signin-birth", "生年月日", true),
    roomNumber: getInput("signin-roomNumber", "部屋番号", true),
    building: getInput("signin-buildings", "棟", true),
  };

  let roomData = { floorId: NaN, roomId: NaN };
  if (typeof form.roomNumber === "string") {
    roomData = splitRoomNumber(form.roomNumber);
    if (typeof roomData === "string") errors.push(roomData);
  }

  Object.values(form).forEach((data) => {
    if (typeof data === "object" && "error" in data) errors.push(data.error);
  });
  const resultDisplay = document.getElementById("result-display");
  if (errors.length > 0) {
    resultDisplay.innerText = "エラーが発生しました: \n" + errors.join("\n");
    return;
  }

  const body = {
    buildingId: parseInt(form.building),
    floorId: roomData.floorId,
    roomId: roomData.roomId,
    userId: parseInt(form.userid),
    birth: form.birth,
  };

  const url = `${API_URL}/login`;
  const res = await fetch(url, {
    body: JSON.stringify(body),
    method: "POST",
  });
  if (!res.ok) {
    if (res.status === 401)
      resultDisplay.innerText = "入力した情報が間違っています。";
    else
      resultDisplay.innerText = "ログインに失敗しました。コード: " + res.status;
    return;
  }
  const result = await res.json();
  localStorage.setItem("uuid", result.uuid);

  location.href = "../home";
}

document.getElementById("register").onclick = () => signin();
