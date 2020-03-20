import compression from "compression";
import express from "express";
import helmet from "helmet";
import sqlite3 from "sqlite3";

function main() {
  openDatabase({
    file: process.env.DB,
    init: [
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL)",
      "CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY, userid INTEGER NOT NULL, description TEXT NOT NULL, duration INTEGER NOT NULL, date TEXT NOT NULL)"
    ]
  }).then(db =>
    createServer()
      .use(express.urlencoded())
      .post("/api/exercise/new-user", (req, res) =>
        newUser(db, req.body.username, (error, id) =>
          res.json(error ? { error } : { username: req.body.username, _id: id })
        )
      )
      .get("/api/exercise/users", (req, res) =>
        getUsers(db, users =>
          res.json(users.map(({ username, id }) => ({ username, _id: id })))
        )
      )
      .post("/api/exercise/add", (req, res) =>
        addExercise(
          db,
          req.body.userId,
          req.body.description,
          req.body.duration,
          req.body.date,
          (error, { username, id, description, duration, date }) =>
            res.json(
              error
                ? { error }
                : { username, _id: id, description, duration, date }
            )
        )
      )
      .get("/api/exercise/log", (req, res) => {})
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
    validateUsername(username);
  } catch (err) {
    k(err.message);
    return;
  }
  db.serialize(() =>
    db
      .run("INSERT OR IGNORE INTO users (username) VALUES (?)", [username])
      .get(
        "SELECT id FROM users WHERE username = ?",
        [username],
        (err, { id }) => k(null, id)
      )
  );
}

export function validateUsername(s) {
  if (!/^\w+$/.test(s)) {
    throw new Error("invalid username");
  }
}

export function getUsers(db, k) {
  db.all("SELECT * FROM users", (err, rows) => k(rows));
}

export function addExercise(db, id, description, duration, date, k) {
  if (!date) {
    date = new Date().toISOString().slice(0, 10);
  }
  try {
    validateDate(date);
  } catch (err) {
    k(err.message, {});
    return;
  }
  db.get(
    "SELECT username FROM users WHERE id = ?",
    [id],
    (err, { username } = {}) =>
      username
        ? db.run(
            "INSERT INTO log (userid, description, duration, date) VALUES (?, ?, ?, ?)",
            [id, description, duration, date],
            () => k(null, { username, id, description, duration, date })
          )
        : k("user not found", {})
  );
}

export function validateDate(s) {
  if (
    !/\d{4}-\d{2}-\d{2}/.test(s) ||
    new Date(s).toString() === "Invalid Date"
  ) {
    throw new Error("invalid date");
  }
}

export function getLog() {}

function log(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(new Date().toUTCString() + ":", ...args);
  }
}

if (process.env.NODE_ENV !== "test") {
  main();
}
