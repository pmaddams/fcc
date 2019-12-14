import { URL } from "url";

import compression from "compression";
import express from "express";
import helmet from "helmet";
import sqlite3 from "sqlite3";

function main() {
  const app = createServer();
  const db = openDatabase(process.env.DB);

  app.post("/api/shorturl/new", (req, res) => {
    try {
      return setURL(db, req.body.url, id =>
        res.json({
          original_url: req.body.url,
          short_url: encode(id)
        })
      );
    } catch (err) {
      if (err instanceof URLError) {
        return res.json({ error: err.message });
      }
      throw err;
    }
  });

  app.get("/api/shorturl/:id", (req, res) =>
    getURL(db, decode(req.params.id), url =>
      url ? res.redirect(301, url) : res.sendStatus(404)
    )
  );

  app.listen(process.env.PORT);
}

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(compression());

  return new Proxy(app, {
    get(target, prop) {
      switch (prop) {
        case "listen":
          return (port = 3000) => {
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

export function openDatabase(file = ":memory:") {
  return new sqlite3.Database(file, err => {
    if (err) {
      throw err;
    }
  });
}

class URLError extends Error {
  constructor(...args) {
    super(...args);
    this.name = this.constructor.name;
  }
}

function setURL(db, url, k) {
  try {
    new URL(url);
  } catch (err) {
    throw new URLError("invalid URL");
  }
}

function getURL(db, id, k) {}

export function encode(n) {
  return n.toString(36);
}

export function decode(s) {
  return parseInt(s, 36);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
