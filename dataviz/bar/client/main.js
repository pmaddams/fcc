import * as d3 from "d3";

const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";
const viewBoxWidth = 300;
const viewBoxHeight = 150;

function main() {
  getData(url).then(data => {
    d3.select("body")
      .append("h1")
      .attr("id", "title")
      .text("U.S. Gross Domestic Product");

    const svg = d3
      .select("body")
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    const scaleX = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([0, viewBoxWidth]);

    const scaleY = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.gdp)])
      .range([viewBoxHeight, 0]);

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d, i) => scaleX(i))
      .attr("y", d => scaleY(d.gdp))
      .attr("width", viewBoxWidth / data.length)
      .attr("height", viewBoxHeight);
  });
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
