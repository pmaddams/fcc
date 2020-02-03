import * as d3 from "d3";

const url = "";

function main() {
  getData(url).then();
}

async function getData(url) {}

if (process.env.NODE_ENV !== "test") {
  main();
}
