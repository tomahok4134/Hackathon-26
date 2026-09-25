async function signin() {
  /**@type {string[]} */
  const errors = [];

  const form = {
    id: getInput("signin-userid", "ユーザID", true),
    pass: getInput("signin-pass", "パスワード", true),
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

  const url = `${API_URL}/login`;
  const res = await fetch(url, {
    body: JSON.stringify(form),
    method: "POST",
  });
  if (!res.ok) {
    if (res.status === 401)
      resultDisplay.innerText = "ユーザIDまたはパスワードが間違っています。";
    else
      resultDisplay.innerText = "ログインに失敗しました。コード: " + res.status;
    return;
  }
  const result = await res.json();
  localStorage.setItem("uuid", result.uuid);

  location.href = "../home";
}

document.getElementById("submit").onclick = (e) => {
  e.preventDefault();
  signin();
};
