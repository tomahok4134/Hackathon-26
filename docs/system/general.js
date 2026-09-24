/**@typedef {import("../../server/src/general").GeneralInfo} GeneralInfo */
/**@typedef {import("../../server/src/user").User} User */

/**@returns {Promise<GeneralInfo>} */
async function getGeneralInfo() {
  return await (await fetch(API_URL)).json();
}

/**
 * @returns {Promise<[true, User]|[false,string]>}
 */
async function isLogining() {
  const uuid = localStorage.getItem("uuid");
  if (!uuid) return [false, "ログインしていません。"];
  const url = new URL(API_URL + "/login");
  url.searchParams.append("uuid", uuid);
  const res = await fetch(url);
  const text = await res.text();
  if (text === "User Error") return [false, "ユーザー情報が不明です。"];
  if (text === "UUID Expired")
    return [false, "ログインの有効期限が切れました。"];
  if (text === "UUID Not Found") return [false, "ログインしていません。"];
  if (!res.ok) return [false, `不明なエラーです: ${res.status}/${text}`];
  return [true, JSON.parse(text)];
}

document.addEventListener("DOMContentLoaded", () => {
  // select.buildingsに注入
  (async () => {
    /**@type {NodeListOf<HTMLSelectElement>} */
    const buildingSelectors = document.querySelectorAll("select.buildings");
    if (buildingSelectors.length === 0) return;
    const general = await getGeneralInfo();
    buildingSelectors.forEach((el) => {
      el.append(
        ...general.buildings.map(({ name }, i) => {
          const o = document.createElement("option");
          o.value = `${i}`;
          o.innerText = name;
          return o;
        }),
      );
    });
  })();
});
