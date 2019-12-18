import { URL } from "url";

import compression from "compression";
import express from "express";
import helmet from "helmet";
import sqlite3 from "sqlite3";

function main() {
  const app = createServer();
  const db = openDatabase(process.env.DB);

  app.use(express.urlencoded());

  app.post("/api/shorturl/new", (req, res) =>
    setURL(db, req.body.url, (error, id) =>
      res.json(
        error
          ? { error }
          : { original_url: req.body.url, short_url: encode(id) }
      )
    )
  );

  app.get("/api/shorturl/:id", (req, res) =>
    getURL(db, decode(req.params.id), url =>
      url ? res.redirect(301, url) : res.sendStatus(404)
    )
  );

  app.use(express.static("public"));

  app.listen(process.env.PORT);
}

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use((req, res, next) => {
    log(req.ip, req.method, req.url);
    next();
  });

  return new Proxy(app, {
    get(target, prop) {
      switch (prop) {
        case "listen":
          return (port = 3000) => {
            target.use((req, res) => res.sendStatus(404));
            target.use((err, req, res, next) => {
              log(err);
              return res.sendStatus(500);
            });

            return target.listen(port, () => log("Listening on port", port));
          };
        default:
          return target[prop];
      }
    }
  });
}

export function openDatabase(file = ":memory:") {
  sqlite3.verbose();
  return new sqlite3.Database(file)
    .on("open", () => log("Opened database", file))
    .on("trace", log);
}

function setURL(db, url, k) {
  try {
    new URL(url);
  } catch (err) {
    return k("invalid URL");
  }
  db.serialize(() =>
    db
      .run(
        "CREATE TABLE IF NOT EXISTS shorturl (id INTEGER PRIMARY KEY, url TEXT UNIQUE NOT NULL)"
      )
      .run("INSERT OR IGNORE INTO shorturl (url) VALUES (?)", [url])
      .get("SELECT id FROM shorturl WHERE url = ?", [url], (err, row) =>
        k(null, row.id)
      )
  );
}

function getURL(db, id, k) {
  db.get("SELECT url FROM shorturl WHERE id = ?", [id], (err, row) =>
    k(row ? row.url : null)
  );
}

export function encode(n) {
  return n.toString(36);
}

export function decode(s) {
  return parseInt(s, 36);
}

function log(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(new Date().toUTCString() + ":", ...args);
  }
}

if (process.env.NODE_ENV !== "test") {
  main();
}
