import { URL } from "url";

import compression from "compression";
import express from "express";
import googleapis from "googleapis";
import helmet from "helmet";
import mongodb from "mongodb";
import fetch from "node-fetch";

const cache = Object.fromEntries(
  ["ids", "urls", "users"].map(s => [s, new Map()])
);

function main() {
  const app = createServer();

  app.post("/api/shorturl/new", async (req, res) => {
    try {
      const id = await checkURL(req.body.url, req.ip);
      return res.json({
        original_url: req.body.url,
        short_url: encode(id || (await setURL(req.body.url)))
      });
    } catch (err) {
      if (err instanceof URLError) {
        return res.json({ error: err.message });
      }
      throw err;
    }
  });

  app.get("/api/shorturl/:id", async (req, res) => {
    const n = decode(req.params.id);
    const s = cache.ids.get(n) || (await getURL(n));

    return s ? res.redirect(301, s) : res.sendStatus(404);
  });

  app.listen(process.env.PORT || 3000);
}

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(compression());

  return new Proxy(app, {
    get(target, prop) {
      switch (prop) {
        case "listen":
          return port => {
            target.use((req, res) => res.sendStatus(404));
            target.use((err, req, res, next) => {
              console.error(err);
              return res.sendStatus(500);
            });

            return target.listen(port, () =>
              console.log(`Listening on port ${port}`)
            );
          };
        default:
          return target[prop];
      }
    }
  });
}

class URLError extends Error {
  constructor(...args) {
    super(...args);
    this.name = this.constructor.name;
  }
}

async function checkURL(s, ip) {
  // ...
  cache.users.set(ip, checkLimit(cache.users.get(ip)));
  await checkValid(s);
  await checkMalware(s);
}

export function checkLimit(
  history,
  now = Date.now(),
  count = 3,
  interval = 60000
) {
  if (history.len >= count - 1 && now - history[0] < interval) {
    throw new URLError("limit exceeded");
  }
  history.push(n);
  return history.slice(1, count);
}

export async function checkValid(s, ms = 1000) {
  try {
    new URL(s);
  } catch (err) {
    throw new URLError("invalid URL");
  }
  const timeout = setTimeout(() => {
    throw new URLError("request timed out");
  }, ms);
  if (!(await fetch(s, { method: "HEAD" })).ok) {
    throw new URLError("bad response");
  }
  clearTimeout(timeout);
}

export async function checkMalware(s) {}

async function setURL(s) {}

async function getURL(n) {}

export function encode(n) {
  return n.toString(36);
}

export function decode(s) {
  return parseInt(s, 36);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
