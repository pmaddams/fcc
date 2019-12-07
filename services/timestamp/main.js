import compression from "compression";
import express from "express";
import helmet from "helmet";

function main() {
  const app = createServer();

  app.get("/api/timestamp/:date?", (req, res) => {
    const n = timestamp(req.params.date);
    return res.json(
      isNaN(n)
        ? {
            error: "Invalid Date"
          }
        : {
            unix: n,
            utc: new Date(n).toUTCString()
          }
    );
  });

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
