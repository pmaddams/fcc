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

    const figure = d3.select("body").append("figure");

    const svg = figure
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
      .attr("class", "bar")
      .attr("data-date", d => d.date.toUTCString())
      .attr("data-gdp", d => d.gdp)
      .attr("x", (d, i) => scaleX(i))
      .attr("y", d => scaleY(d.gdp))
      .attr("width", (0.75 * viewBoxWidth) / data.length)
      .attr("height", viewBoxHeight)
      .on("mouseover", d => d3.select("#tooltip").text(tooltip(d)));

    figure.append("figcaption").attr("id", "tooltip");
  });
}

async function getData(url) {
  return (await d3.json(url)).data.map(p => ({
    date: new Date(p[0]),
    gdp: p[1]
  }));
}

function tooltip(d) {
  let q = d.date.getUTCMonth() / 3 + 1;
  if (![1, 2, 3, 4].includes(q)) {
    return "";
  }
  return `Q${q} ${d.date.getUTCFullYear()}: $${d.gdp} billion`;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
