import * as d3 from "d3";

const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";

function main() {
  getData(url).then();
}

async function getData(url) {
  return (await d3.json(url)).data.map(p => ({
    date: new Date(p[0]),
    gdp: p[1]
  }));
}

if (process.env.NODE_ENV !== "test") {
  main();
}
