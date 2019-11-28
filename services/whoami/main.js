import compression from "compression";
import express from "express";
import helmet from "helmet";

function main() {
  const app = createServer();

  app.get("/api/whoami", (req, res) =>
    res.json({
      ipaddress: req.ip,
      language: req.headers["accept-language"],
      software: req.headers["user-agent"]
    })
  );

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

if (process.env.NODE_ENV !== "test") {
  main();
}
