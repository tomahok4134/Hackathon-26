import { serve } from "@hono/node-server";
import { Hono } from "hono";
import * as fs from "fs/promises";
import { DATA_FOLDER } from "./config.js";
import { exists, serializeUserId, unserializeUserId } from "./util.js";
import { setCookie } from "hono/cookie";
import { getRoom } from "./room.js";
import { getUser, modifyUser, newUser } from "./user.js";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { login, logining } from "./login.js";
import { cors } from "hono/cors";

async function checkData() {
  if (await exists(DATA_FOLDER, true)) await fs.mkdir(DATA_FOLDER);
  if (await exists(`${DATA_FOLDER}/building`, true))
    await fs.mkdir(`${DATA_FOLDER}/building`);
  if (await exists(`${DATA_FOLDER}/sessions.json`, true))
    await fs.writeFile(`${DATA_FOLDER}/sessions.json`, "[]");
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
  const result = await login(
    data.buildingId,
    data.floorId,
    data.roomId,
    data.userId,
    data.birth,
  );

  if (typeof result === "number")
    return c.body("", result as ContentfulStatusCode);
  return c.json(result);
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
  const buildingId = parseInt(c.req.param("b")),
    floorId = parseInt(c.req.param("f")),
    roomId = parseInt(c.req.param("r")),
    userId = parseInt(c.req.param("u")),
    content = await c.req.json();

  const result = await modifyUser(buildingId, floorId, roomId, userId, content);
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
