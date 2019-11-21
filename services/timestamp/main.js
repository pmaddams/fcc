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
    get(target, prop) {
      return prop === "listen" ? (port) => {
        target.use((err, req, res, next) => res.sendStatus(500));

        target.listen(port, () => console.log(`Listening on port ${port}`));
      } : target[prop];
    }
  });
}

export function makeHandler(param) {
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
  }
}

export function timestamp(s) {
  return s ? Date.parse(s) : Date.now();
}

if (process.env.NODE_ENV !== "test") {
  main();
}
