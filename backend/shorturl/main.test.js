import fetch from "node-fetch";

import {
  openDatabase,
  createServer,
  setURL,
  getURL,
  encode,
  decode
} from "./main.js";

test("openDatabase()", () => {
  const db = openDatabase();
  const a = ["foo", "bar", "baz"];

  db.serialize(() => {
    db.run(
      "CREATE TABLE test (id INTEGER PRIMARY KEY, s TEXT UNIQUE NOT NULL)"
    );
    let stmt = db.prepare("INSERT OR IGNORE INTO test (s) VALUES (?)");
    for (const s of a) {
      for (let i = 0; i < 2; i++) {
        stmt.run(s);
      }
    }
    stmt.finalize();
    stmt = db.prepare("SELECT id FROM test WHERE s = ?");
    for (let i = 0; i < 3; i++) {
      stmt.get(a[i], (err, row) => expect(row.id).toBe(i + 1));
    }
    stmt.finalize();

    db.close();
  });
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

test("database operations", () => {
  const db = openDatabase();
  const url1 = "http://foo.com";
  const url2 = "https://bar.baz.io/api?key=value&something=else#section";

  setURL(db, "not a url", (error, id) => expect(id).toBeUndefined());
  setURL(db, url1, (error, id) => expect(id).toBe(1));
  setURL(db, url2, (error, id) => expect(id).toBe(2));

  getURL(db, 1, (error, url) => expect(url).toBe(url1));
  getURL(db, 2, (error, url) => expect(url).toBe(url2));
  getURL(db, 3, (error, url) => expect(url).toBeUndefined());

  db.close();
});

test.each([
  [0, "0"],
  [1, "1"],
  [2147483647, "zik0zj"]
])("encode(%p)", (n, expected) => expect(encode(n)).toBe(expected));

test.each([
  ["0", 0],
  ["1", 1],
  ["zik0zj", 2147483647]
])("decode(%p)", (s, expected) => expect(decode(s)).toBe(expected));
