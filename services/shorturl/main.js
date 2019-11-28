import compression from "compression";
import express from "express";
import googleapis from "googleapis";
import helmet from "helmet";
import mongodb from "mongodb";
import fetch from "node-fetch";

function main() {
  const app = createServer();

  app.get("/api/shorturl/new/:url", async (req, res) => {
    try {
      await checkURL(req.params.url, req.ip);
    } catch (err) {
      switch (err.constructor) {
        case RateLimitError:
          break;
        case ParseError:
          break;
        case DuplicateError:
          break;
        case ReachableError:
          break;
        case MalwareError:
          break;
        default:
          throw err;
      }
    }
    return res.json({
      original_url: url,
      short_url: encode(await writeURL(req.params.url))
    });
  });

  app.get("/api/shorturl/:id", async (req, res) =>
    res.redirect(301, await readURL(decode(req.params.id)))
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

function checkURL(url, ip) {}

class CustomError extends Error {
  constructor(...args) {
    super(...args);
    this.name = this.constructor.name;
  }
}

class RateLimitError extends CustomError {}

function checkRateLimit() {}

class ParseError extends CustomError {}

function checkParse() {}

class DuplicateError extends CustomError {}

function checkDuplicate() {}

class ReachableError extends CustomError {}

function checkReachable() {}

class MalwareError extends CustomError {}

function checkMalware() {}

function writeURL(url) {}

function readURL(id) {}

export function encode(n) {
  return n.toString(36);
}

export function decode(s) {
  return parseInt(s, 36);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
