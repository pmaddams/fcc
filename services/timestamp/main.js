import compression from "compression";
import express from "express";
import helmet from "helmet";

function main() {
  const app = express();

  app.use(helmet());
  app.use(compression());

  const param = "date";
  app.get(`/api/timestamp/:${param}?`, makeHandler(param));

  app.use((err, req, res, next) => res.sendStatus(500));

  const server = app.listen(process.env.PORT || 3000, () => {
    const ip = server.address();
    console.log(`Running at ${ip.address}:${ip.port}`);
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
