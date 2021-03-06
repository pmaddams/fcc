import compression from "compression";
import express from "express";
import helmet from "helmet";
import multer from "multer";

function main() {
  const upload = multer({ storage: multer.memoryStorage() });

  createServer()
    .post("/", upload.single("upfile"), (req, res) =>
      res.json({ name: req.file.originalname, size: req.file.size })
    )
    .use(express.static("public"))
    .listen(process.env.PORT);
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

function log(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(new Date().toUTCString() + ":", ...args);
  }
}

if (process.env.NODE_ENV !== "test") {
  main();
}
