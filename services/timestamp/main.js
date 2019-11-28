import compression from "compression";
import express from "express";
import helmet from "helmet";

function main() {
  const app = createServer();

  app.get("/api/timestamp/:date?", (req, res) => {
    const n = timestamp(req.params.date);
    if (isNaN(n)) {
      res.status(400).json({
        error: "Invalid Date"
      });
    } else {
      res.json({
        unix: n,
        utc: new Date(n).toUTCString()
      });
    }
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
              res.sendStatus(500);
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

export function timestamp(s) {
  let n;
  if (typeof s === "undefined") {
    n = Date.now();
  } else if (isNaN((n = +s))) {
    n = Date.parse(s);
  }
  return n;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
