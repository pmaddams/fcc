import compression from "compression";
import express from "express";
import helmet from "helmet";
import sqlite3 from "sqlite3";

function main() {
  openDatabase({
    file: process.env.DB,
    init: [
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL)",
      "CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY, date TEXT NOT NULL, description TEXT NOT NULL, duration INTEGER NOT NULL)"
    ]
  }).then(db =>
    createServer()
      .use(express.urlencoded())
      .post("/api/exercise/new-user", (req, res) =>
        newUser(db, req.body.username, (error, id) =>
          res.json(error ? { error } : { _id: id, username: req.body.username })
        )
      )
      .get("", () => {})
      .post("", () => {})
      .get("", () => {})
      .use(express.static("public"))
      .listen(process.env.PORT)
  );
}

export function openDatabase({ file = ":memory:", init = [] } = {}) {
  sqlite3.verbose();
  const db = new sqlite3.Database(file)
    .on("open", () => log("Opened database", file))
    .on("trace", log);

  return new Promise((resolve, reject) =>
    db.exec(Array.isArray(init) ? init.join("; ") : init, err =>
      err ? reject(err) : resolve(db)
    )
  );
}

export function createServer() {
  return new Proxy(
    express()
      .use(helmet())
      .use(compression())
      .use((req, res, next) => {
        log(req.ip, req.method, req.url);
        next();
      }),
    {
      get(target, prop) {
        switch (prop) {
          case "listen":
            return (port = 3000) =>
              target
                .use((req, res) => res.sendStatus(404))
                .use((err, req, res, next) => {
                  log(err);
                  return res.sendStatus(500);
                })
                .listen(port, () => log("Listening on port", port));
          default:
            return target[prop];
        }
      }
    }
  );
}

export function newUser(db, username, k) {
  try {
    validate(username);
  } catch (err) {
    k(err.message);
    return;
  }
  db.serialize(() =>
    db
      .run("INSERT OR IGNORE INTO users (username) VALUES (?)", [username])
      .get("SELECT id FROM users WHERE username = ?", [username], (err, row) =>
        k(null, row.id)
      )
  );
}

export function validate(username) {
  if (!/^\w+$/.test(username)) {
    throw new Error("invalid username");
  }
}

function log(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(new Date().toUTCString() + ":", ...args);
  }
}

if (process.env.NODE_ENV !== "test") {
  main();
}
