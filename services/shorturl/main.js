import { URL } from "url";

import compression from "compression";
import express from "express";
import helmet from "helmet";

function main() {
  const app = createServer();

  app.post("/api/shorturl/new", async (req, res) => {
    try {
      return res.json({
        original_url: req.body.url,
        short_url: encode(await setURL(req.body.url))
      });
    } catch (err) {
        return res.json({ error: err.message });
    }
  });

  app.get("/api/shorturl/:id", async (req, res) => {
    const url = await getURL(decode(req.params.id));

    return url ? res.redirect(301, url) : res.sendStatus(404);
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

async function setURL(url) {
}

async function getURL(id) {
}

export function encode(n) {
  return n.toString(36);
}

export function decode(s) {
  return parseInt(s, 36);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
