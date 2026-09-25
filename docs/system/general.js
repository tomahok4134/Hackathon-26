/**@typedef {import("../../server/src/general").GeneralInfo} GeneralInfo */
/**@typedef {import("../../server/src/user").User} User */
/**@typedef {import("../../server/src/login").Admin} Admin */

const globalLoginData = isLogining();

/**@returns {Promise<GeneralInfo>} */
async function getGeneralInfo() {
  return await (await fetch(API_URL)).json();
}

/**
 * @returns {Promise<[true, User|Admin]|[false,string]>}
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

/**
 * @param {User|Admin} userOrAdmin
 * @returns {userOrAdmin is Admin}
 */
function isAdmin(userOrAdmin) {
  return "pass" in userOrAdmin;
}

document.addEventListener("DOMContentLoaded", async () => {
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

  addHeader();

  const login = await globalLoginData;

  let label = login[0] ? login[1].name : "未ログイン";
  if (login[0] && isAdmin(login[1])) {
    label += "(管理者)";
    document.body.classList.add("admin-ui");
  }

  applyHeaderURL(login[1]);

  /**@type {NodeListOf<HTMLElement>} */
  const usernameElements = document.querySelectorAll(".username");

  if (usernameElements.length !== 0)
    usernameElements.forEach((el) => {
      el.innerText = label;
    });
});

function addHeader() {
  const header = document.createElement("header");
  document.body.insertAdjacentElement("afterbegin", header);

  header.innerHTML = `
    <button id="header-back"></button>
    <a id="header-title" href="#">デジタル回覧板</a>
    <div id="header-user">
      <span class="material-symbols-outlined">
        face
      </span>
      <div class="username"></div>
    </div>
  `;

  document.querySelector("#header-back").onclick = () => history.back();
}

/**
 * @param {User|Admin|string|undefined} account
 */
function applyHeaderURL(account) {
  if (typeof account === "string") account = undefined;
  const path = account ? getURL(`home/index.html`) : getURL(`index.html`);
  document.querySelector("#header-title").href = path;

  document.querySelector("#header-user").onclick = () => {
    if (account) {
      localStorage.removeItem("uuid");
      location.href = getURL(`index.html`);
    } else {
      location.href = getURL(`signin/index.html`);
    }
  };

  const header = document.querySelector("header");
  if (!header) return;
  header.style.backgroundColor = !account
    ? "#742774"
    : isAdmin(account)
      ? "#896113"
      : "#204e8a";
}
