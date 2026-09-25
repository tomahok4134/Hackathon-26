async function submit() {
  /**@type {string[]} */
  const errors = [];

  const form = {
    title: getInput("title", "タイトル", true),
    content: getInput("content", "内容", true),
    uuid: localStorage.getItem("uuid"),
  };

  Object.values(form).forEach((data) => {
    if (typeof data === "object" && "error" in data) errors.push(data.error);
  });
  const resultDisplay = document.getElementById("result-display");
  if (errors.length > 0) {
    resultDisplay.innerText = "エラーが発生しました: \n" + errors.join("\n");
    return;
  }

  const url = `${API_URL}/news`;
  const res = await fetch(url, {
    body: JSON.stringify(form),
    method: "POST",
  });
  if (!res.ok) {
    if (res.status === 403)
      resultDisplay.innerText =
        "あなたは管理者ではありません。ニュースを作成できません。";
    if (res.status === 401)
      resultDisplay.innerText =
        "ニュースの作成に失敗しました。再ログインを推奨します。";
    else
      resultDisplay.innerText =
        "ニュースの作成に失敗しました。コード: " + res.status;
    return;
  }

  location.href = "../home";
}

document.getElementById("submit").onclick = (e) => {
  e.preventDefault();
  submit();
};
