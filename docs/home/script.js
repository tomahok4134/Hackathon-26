/**@typedef {import("../../server/src/recent").RecentChange} RecentChange */

async function showNews() {
  /**
   * @type {{title:string,content:string,author:string,date:string}[]}
   */
  const news = await (await fetch(`${API_URL}/news?limit=10`)).json();

  const newsElements = news.map(({ title, content, author, date }, i) => {
    const wrap = document.createElement("div");
    wrap.className = "news-wrapper";
    const card = document.createElement("div");
    card.className = "news-card";
    const data = document.createElement("div");
    data.className = "news-data";

    const dateEl = document.createElement("span");
    dateEl.className = "news-date";
    dateEl.innerText = new Date(date).toLocaleString("ja-jp");
    const authorEl = document.createElement("span");
    authorEl.className = "news-author";
    authorEl.innerText = author;

    const titleEl = document.createElement("div");
    titleEl.className = "news-title";
    titleEl.innerText = title;

    const contentEl = document.createElement("div");
    contentEl.className = "news-content";
    contentEl.innerText = content;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "news-delete admin-only link";
    deleteBtn.innerText = "削除";
    deleteBtn.onclick = async () => {
      const res = await fetch(
        `${API_URL}/news/${i}?uuid=${localStorage.getItem("uuid")}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) location.reload();
    };

    data.append(dateEl, authorEl, deleteBtn);
    card.append(data, titleEl, contentEl);
    wrap.append(card);
    return wrap;
  });

  document.getElementById("News").append(...newsElements);
}

async function showRecents() {
  /**
   * @type {RecentChange[]}
   */
  const recent = await (await fetch(`${API_URL}/recents?limit=30`)).json();

  const login = await globalLoginData;
  if (!login[0]) return;
  const userRoom = unserializeUserId(login[1].id);
  const admin = isAdmin(login[1]);

  const newsElements = recent.flatMap((r, i) => {
    const targetRoom = unserializeUserId(r.targetUserId);
    const wrap = document.createElement("div");
    wrap.className = "update-wrapper";
    const card = document.createElement("div");
    card.className = "update-card";

    const dateEl = document.createElement("span");
    dateEl.className = "update-date";
    dateEl.innerText = new Date(r.date).toLocaleDateString("ja-jp");

    const contentEl = document.createElement("span");
    contentEl.className = "update-content";

    const userBtn = document.createElement("button");
    userBtn.className = "link";
    userBtn.innerText = r.targetUserName;
    userBtn.onclick = async () => {
      location.href = getURL(`members/index.html?id=${r.targetUserId}`);
    };

    let text = "";
    const ids = unserializeUserId(r.targetUserId);
    if (userRoom.building !== targetRoom.building && !admin) return [];
    const roomNum = joinRoomNumber(ids.floor, ids.room);
    switch (r.type) {
      case "new":
        text = `が${roomNum}号室に入居しました。`;
        break;
      case "leave":
        text = `が${roomNum}号室から退去しました。`;
        break;
      case "modify":
        if (!admin) {
          if (userRoom.floor !== targetRoom.floor) return [];
          if (userRoom.room !== targetRoom.room) return [];
        }
        text = `がプロフィールを更新しました。`;
        break;
      default:
        return [];
    }

    contentEl.append(userBtn, text);
    card.append(dateEl, contentEl);
    wrap.append(card);
    return [wrap];
  });

  document.getElementById("Updates").append(...newsElements);
}

function showSignupedPopup() {
  const url = new URL(location);
  const id = url.searchParams.get("userId");
  if (!id) return;
  const div = document.createElement("div");
  div.innerHTML =
    "サインアップが完了しました！<br>あなたのユーザIDは<strong></strong>です。<br>今後のログインに使用するため、覚えておいてください。";
  div.querySelector("strong").innerText = id;
  showPopup(div, []);
  url.searchParams.delete("userId");
  history.replaceState({}, "", url);
}

returnIfNotLogined();
showNews();
showRecents();
showSignupedPopup();
