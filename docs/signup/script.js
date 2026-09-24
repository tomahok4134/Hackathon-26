async function signup() {
  /**@type {string[]} */
  const errors = [];
  const roomNumber = getInput("signup-roomNumber", "部屋番号", true),
    building = getInput("signup-buildings", "棟", true);

  if (typeof roomNumber === "object") errors.push(roomNumber.error);
  if (typeof building === "object") errors.push(building.error);

  const formData = {
    name: getInput("signup-name", "名前", true),
    gender: getInput("signup-gender", "性別", true),
    birth: getInput("signup-birth", "生年月日", true),
    relationship: getInput("signup-relationship", "世帯主との関係", true),
    comment: getInput("signup-comment", "コメント"),
    privateInfos: getCheckboxs(["gender", "birth", "relationship"]),
  };

  let roomData = { floorId: NaN, roomId: NaN };
  if (typeof roomNumber === "string") {
    roomData = splitRoomNumber(roomNumber);
    if (typeof roomData === "string") errors.push(roomData);
  }

  Object.values(formData).forEach((data) => {
    if (typeof data === "object" && "error" in data) errors.push(data.error);
  });
  if (errors.length > 0) {
    return void alert("エラーが発生しました: \n" + errors.join("\n"));
  }

  const url = `${API_URL}/db/${building}/${roomData.floorId}/${roomData.roomId}`;
  console.log({
    roomData,
    building,
    formData,
    url,
  });
  const res = await fetch(url, {
    body: JSON.stringify(formData),
    method: "POST",
  });
  if (!res.ok) {
    return void alert("登録に失敗しました。コード: " + res.status);
  }
  const result = await res.json();
  localStorage.setItem("uuid", result.uuid);
  return void alert(
    `登録が完了しました。あなたのユーザーIDは${result.index}です。`,
  );
}

document.getElementById("register").onclick = () => signup();
