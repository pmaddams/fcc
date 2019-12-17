import fetch from "node-fetch";

import { createServer, openDatabase, encode, decode } from "./main.js";

describe("createServer()", () => {
  const port = 8080;
  let server;

  beforeAll(() => {
    const app = createServer();

    app.get("/", (req, res) => res.sendStatus(200));
    app.get("/error", (req, res) => {
      throw new Error("Secret");
    });

    server = app.listen(port);
  });

  afterAll(() => server.close());

  const url = `http://localhost:${port}`;

  test("200", async () => {
    const res = await fetch(url);
    expect(res.status).toBe(200);
  });

  test("404", async () => {
    const res = await fetch(`${url}/admin`);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Not Found");
  });

  test("500", async () => {
    const res = await fetch(`${url}/error`);
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Internal Server Error");
  });
});

test("openDatabase()", () => {
  const db = openDatabase(),
    a = ["foo", "bar", "baz"];
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
    stmt = db.prepare("SELECT id FROM test WHERE s = ?");
    for (let i = 0; i < 3; i++) {
      stmt.get(a[i], (err, row) => expect(row.id).toBe(i + 1));
    }
  });
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
