import { URL } from "url";

import compression from "compression";
import express from "express";
import helmet from "helmet";
import sqlite3 from "sqlite3";

function main() {
  const app = createServer();
  const db = openDatabase(process.env.DB);

  app.post("/api/shorturl/new", (req, res) =>
    setURL(db, req.body.url, (id, error) =>
      res.json(
        id ? { original_url: req.body.url, short_url: encode(id) } : { error }
      )
    )
  );

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

function setURL(db, url, k) {
  try {
    new URL(url);
  } catch (err) {
    k(null, "invalid URL");
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
