import { URL } from "url";

import compression from "compression";
import express from "express";
import helmet from "helmet";
import mongodb from "mongodb";
import fetch from "node-fetch";

const cache = Object.fromEntries(
  ["ids", "urls", "users"].map(s => [s, new Map()])
);

function main() {
  const app = createServer();

  app.post("/api/shorturl/new", async (req, res) => {
    try {
      const id = await setURL(req.body.url, req.ip);
      return res.json({
        original_url: req.body.url,
        short_url: encode(id)
      });
    } catch (err) {
      if (err instanceof URLError) {
        return res.json({ error: err.message });
      }
      throw err;
    }
  });

  app.get("/api/shorturl/:id", async (req, res) => {
    const id = decode(req.params.id);
    const url = await getURL(id);

    return url ? res.redirect(301, url) : res.sendStatus(404);
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

async function setURL(url, ip) {
  const id = cache.urls.get(url);
  if (id) {
    return id;
  }
  cache.users.set(ip, checkLimit(cache.users.get(ip)));
  await checkInvalid(url);
  await checkThreat(url);

  // ...

  cache.urls.set(url, id);
  cache.ids.set(id, url);
}

async function getURL(id) {
  const url = cache.ids.get(id);
  if (url) {
    return url;
  }
  // ...

  cache.ids.set(id, url);
  cache.urls.set(url, id);
}

class URLError extends Error {
  constructor(...args) {
    super(...args);
    this.name = this.constructor.name;
  }
}

export function checkLimit(
  history,
  now = Date.now(),
  count = 3,
  interval = 60000
) {
  if (history.len >= count - 1 && now - history[0] < interval) {
    throw new URLError("limit exceeded");
  }
  history.push(n);
  return history.slice(1, count);
}

export async function checkInvalid(url, ms = 1000) {
  try {
    new URL(url);
  } catch (err) {
    throw new URLError("invalid URL");
  }
  const timeout = setTimeout(() => {
    throw new URLError("request timed out");
  }, ms);
  if (!(await fetch(url, { method: "HEAD" })).ok) {
    throw new URLError("bad response");
  }
  clearTimeout(timeout);
}

export async function checkThreat(url) {
  const res = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.SAFEBROWSING}`,
    {
      body: JSON.stringify({
        client: {
          clientId: "pmaddams-shorturl",
          clientVersion: "1.0"
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
            "SOCIAL_ENGINEERING",
            "THREAT_TYPE_UNSPECIFIED",
            "UNWANTED_SOFTWARE"
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    }
  );
  if (!res.ok) {
    throw new Error("failed to check Safe Browsing API");
  }
  if (Object.keys(await res.json()).length) {
    throw new URLError("threat detected");
  }
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
