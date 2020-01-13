import fetch from "node-fetch";

import { createServer, timestamp } from "./main.js";

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

test("timestamp(undefined)", () => {
  const n = Date.now();
  const saved = Date.now;
  global.Date.now = () => n;

  expect(timestamp(undefined)).toBe(n);

  global.Date.now = saved;
});

test.each([
  ["0", 0],
  ["1451001600000", 1451001600000],
  ["2015-12-25", 1451001600000]
])("timestamp(%p)", (s, n) => expect(timestamp(s)).toBe(n));

test.each(["foo", "1bar", "baz2015-12-25"])("timestamp(%p)", s =>
  expect(timestamp(s)).toBeNaN()
);
