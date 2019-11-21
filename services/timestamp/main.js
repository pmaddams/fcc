import compression from "compression";
import express from "express";
import helmet from "helmet";

function main() {
  const app = express();

  app.use(helmet());
  app.use(compression());

  const server = app.listen(process.env.PORT || 3000, () => {
    const ip = server.address();
    console.log(`Running at ${ip.address}:${ip.port}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  main();
}
