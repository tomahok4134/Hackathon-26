import { serve } from "@hono/node-server";
import { Hono } from "hono";
import * as fs from "fs/promises";
import { DATA_FOLDER } from "./config.js";
import { exists, isAdmin, serializeUserId, unserializeUserId } from "./util.js";
import { setCookie } from "hono/cookie";
import { getRoom } from "./room.js";
import { getUser, modifyUser, newUser } from "./user.js";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { login, logining } from "./login.js";
import { cors } from "hono/cors";
import { getRecentChange } from "./recent.js";

async function checkData() {
  if (await exists(DATA_FOLDER, true)) await fs.mkdir(DATA_FOLDER);
  if (await exists(`${DATA_FOLDER}/building`, true))
    await fs.mkdir(`${DATA_FOLDER}/building`);
  if (await exists(`${DATA_FOLDER}/admins.json`, true))
    await fs.writeFile(
      `${DATA_FOLDER}/admins.json`,
      JSON.stringify([
        {
          name: "デフォルト管理者",
          id: "admin",
          pass: `Admin:${Math.floor(Math.random() * 1000000)}`.padStart(6, "0"),
        },
      ]),
    );
  if (await exists(`${DATA_FOLDER}/sessions.json`, true))
    await fs.writeFile(`${DATA_FOLDER}/sessions.json`, "[]");
  if (await exists(`${DATA_FOLDER}/news.json`, true))
    await fs.writeFile(`${DATA_FOLDER}/news.json`, "[]");
  if (await exists(`${DATA_FOLDER}/recent.json`, true))
    await fs.writeFile(`${DATA_FOLDER}/recent.json`, "[]");
  if (await exists(DATA_FOLDER + "/index.json", true))
    await fs.writeFile(
      DATA_FOLDER + "/index.json",
      JSON.stringify({
        buildings: [
          {
            name: "デフォルト棟",
            floors: [],
          },
        ],
      }),
    );
}

const app = new Hono();

app.use("*", cors());

app.get("/", async (c) => {
  const data = await fs.readFile(`${DATA_FOLDER}/index.json`);
  c.header("Content-Type", "application/json; charset=utf-8");
  c.header("Content-Length", "" + data.length);
  return c.body(data);
});

app.get("/login", async (c) => {
  const uuid = c.req.query("uuid");
  if (!uuid) return c.body("", 401);
  const loginData = await logining(uuid);
  switch (loginData) {
    case "user-error":
      return c.text("User Error", 400);
    case "expired":
      return c.text("UUID Expired", 401);
    case "uuid-notfound":
      return c.text("UUID Not Found", 400);
    default:
      return c.json(loginData);
  }
});

app.post("/login", async (c) => {
  const data = await c.req.json();
  const result = await login(data.id, data.pass);

  if (typeof result === "number")
    return c.body("", result as ContentfulStatusCode);
  return c.json(result);
});

app.get("/news", async (c) => {
  let news: any[] = JSON.parse(
    await fs.readFile(`${DATA_FOLDER}/news.json`, "utf8"),
  );
  const limit = parseInt(c.req.query("limit") ?? "");
  const start = parseInt(c.req.query("start") ?? "");
  news = news.slice(
    Number.isNaN(start) ? 0 : start,
    Number.isNaN(limit) ? Infinity : limit - 1,
  );
  return c.json(news);
});

app.post("/news", async (c) => {
  const data = await c.req.json();
  const user = await logining(data.uuid ?? "");
  if (typeof user === "string") return c.text(user, 401);
  if (!isAdmin(user)) return c.text("", 403);

  const news = JSON.parse(
    await fs.readFile(`${DATA_FOLDER}/news.json`, "utf8"),
  );
  news.unshift({
    title: data.title ?? "ニュース",
    content: data.content ?? "",
    author: user.name,
    date: new Date().toISOString(),
  });
  await fs.writeFile(`${DATA_FOLDER}/news.json`, JSON.stringify(news));

  return c.json(news[0], 201);
});

app.delete("/news/:i", async (c) => {
  const index = parseInt(c.req.param("i"));
  const uuid = c.req.query("uuid");
  if (!uuid) return c.body("", 401);
  const user = await logining(uuid ?? "");
  if (typeof user === "string") return c.text(user, 401);
  if (!isAdmin(user)) return c.text("", 403);
  if (Number.isNaN(index))
    return c.text(`not allow index ${c.req.param("i")}`, 400);

  let news: any[] = JSON.parse(
    await fs.readFile(`${DATA_FOLDER}/news.json`, "utf8"),
  );
  news = news.filter((_, i) => i !== index);
  await fs.writeFile(`${DATA_FOLDER}/news.json`, JSON.stringify(news));

  return c.body(null, 204);
});

app.get("/recents", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "");
  const changes = await getRecentChange(Number.isNaN(limit) ? Infinity : limit);
  return c.json(changes);
});

app.get("/db/:b/:f/:r", async (c) => {
  const buildingId = parseInt(c.req.param("b")),
    floorId = parseInt(c.req.param("f")),
    roomId = parseInt(c.req.param("r"));

  const result = await getRoom(buildingId, floorId, roomId);
  if (typeof result === "number")
    return c.body("", result as ContentfulStatusCode);
  return c.json(result);
});

app.post("/db/:b/:f/:r", async (c) => {
  const buildingId = parseInt(c.req.param("b")),
    floorId = parseInt(c.req.param("f")),
    roomId = parseInt(c.req.param("r")),
    content = await c.req.json();

  const result = await newUser(buildingId, floorId, roomId, content);
  if (typeof result === "number")
    return c.body("", result as ContentfulStatusCode);
  return c.json(result);
});

app.post("/db/:b/:f/:r/:u", async (c) => {
  // 互換性のため維持
  const buildingId = parseInt(c.req.param("b")),
    floorId = parseInt(c.req.param("f")),
    roomId = parseInt(c.req.param("r")),
    userId = parseInt(c.req.param("u")),
    content = await c.req.json();

  const result = await modifyUser(content);
  if (typeof result === "number")
    return c.body("", result as ContentfulStatusCode);
  return c.json(result);
});

serve(
  {
    fetch: app.fetch,
    port: 8000,
  },
  (info) => {
    checkData();
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
