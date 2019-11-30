import url from "url";

import compression from "compression";
import express from "express";
import googleapis from "googleapis";
import helmet from "helmet";
import mongodb from "mongodb";
import fetch from "node-fetch";

const cache = namespace(() => new Map(), "users", "urls", "ids");

const errors = namespace(name => Symbol(name), "limit", "valid", "malware");

function main() {
  const app = createServer();

  app.post("/api/shorturl/new/:url", async (req, res) => {
    try {
      const id = await checkURL(req.params.url, req.ip);
      return res.json({
        original_url: req.params.url,
        short_url: encode(id || (await setURL(req.params.url)))
      });
    } catch (err) {
      switch (err.type) {
        case errors.limit:
        case errors.valid:
        case errors.malware:
          return res.json({ error: err.message });
        default:
          throw err;
      }
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
  constructor(type, ...args) {
    super(...args);
    this.type = type;
  }
}

async function checkURL(s, ip) {
  // ...
  cache.users.set(ip, checkLimit(cache.users.get(ip)));
  await checkValid(s);
  await checkMalware;
}

export function checkLimit(
  history,
  now = Date.now(),
  count = 3,
  interval = 60000
) {
  if (history.len >= count - 1 && now - history[0] < interval) {
    throw new URLError(errors.limit, "limit exceeded");
  }
  history.push(n);
  return history.slice(1, count);
}

function checkValid() {}

function checkMalware() {}

function setURL(s) {}

function getURL(n) {}

export function encode(n) {
  return n.toString(36);
}

export function decode(s) {
  return parseInt(s, 36);
}

export function namespace(f, ...args) {
  return Object.freeze(Object.fromEntries(args.map(x => [x, f(x)])));
}

if (process.env.NODE_ENV !== "test") {
  main();
}
