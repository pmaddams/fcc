import fetch from "node-fetch";

import { openDatabase, createServer } from "./main.js";

describe("openDatabase()", () => {
  const init = table =>
    `CREATE TABLE ${table} (id INTEGER PRIMARY KEY, s TEXT UNIQUE NOT NULL)`;

  const proc = (db, table) =>
    db.serialize(() => {
      const a = ["foo", "bar", "baz"];

      let stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (s) VALUES (?)`);
      for (const s of a) {
        for (let i = 0; i < 2; i++) {
          stmt.run(s);
        }
      }
      stmt.finalize();

      stmt = db.prepare(`SELECT id FROM ${table} WHERE s = ?`);
      for (let i = 0; i < 3; i++) {
        stmt.get(a[i], (err, row) => expect(row.id).toBe(i + 1));
      }
      stmt.finalize();
    });

  test("no arguments", () =>
    openDatabase().then(db =>
      db.serialize(() => {
        db.run(init("test"));
        proc(db, "test");
        db.close();
      })
    ));

  test("one statement", () =>
    openDatabase({ init: init("test") }).then(db =>
      db.serialize(() => {
        proc(db, "test");
        db.close();
      })
    ));

  test("array of statements", () =>
    openDatabase({ init: [init("test1"), init("test2")] }).then(db =>
      db.serialize(() => {
        proc(db, "test1");
        proc(db, "test2");
        db.close();
      })
    ));
});

describe("createServer()", () => {
  const port = 8080;
  let server;

  beforeAll(() => {
    server = createServer()
      .get("/", (req, res) => res.sendStatus(200))
      .get("/error", (req, res) => {
        throw new Error("Secret");
      })
      .listen(port);
  });

  afterAll(() => server.close());

  const url = `http://localhost:${port}`;

  test("200", async () => {
    const res = await fetch(url);
    expect(res.status).toBe(200);
  });

  test("404", async () => {
    const res = await fetch(url + "/admin");
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Not Found");
  });

  test("500", async () => {
    const res = await fetch(url + "/error");
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Internal Server Error");
  });
});
