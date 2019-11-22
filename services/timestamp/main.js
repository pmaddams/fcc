import compression from "compression";
import express from "express";
import helmet from "helmet";

function main() {
  const app = createServer();

  const param = "date";
  app.get(`/api/timestamp/:${param}?`, makeHandler(param));

  app.listen(process.env.PORT || 3000);
}

function createServer() {
  const app = express();

  app.use(helmet());
  app.use(compression());

  return new Proxy(app, {
    get: (target, prop) =>
      prop === "listen"
        ? port => {
            target.use((err, req, res, next) => res.sendStatus(500));

            return target.listen(port, () =>
              console.log(`Listening on port ${port}`)
            );
          }
        : target[prop]
  });
}

function makeHandler(param) {
  return (req, res) => {
    const n = timestamp(req.params[param]);
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
  };
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
