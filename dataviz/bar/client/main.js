import * as d3 from "d3";

const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";
const viewBoxWidth = 1200;
const paddingWidth = 0.05 * viewBoxWidth;
const viewBoxHeight = 600;
const paddingHeight = 0.05 * viewBoxHeight;

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
      .range([paddingWidth, viewBoxWidth - paddingWidth]);

    const scaleY = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.gdp)])
      .range([viewBoxHeight - paddingHeight, paddingHeight]);

    const scaleHeight = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.gdp)])
      .range([0, viewBoxHeight - 2 * paddingHeight]);

    const scaleYears = d3
      .scaleLinear()
      .domain([
        data[0].date.getUTCFullYear(),
        data[data.length - 1].date.getUTCFullYear()
      ])
      .range([paddingWidth, viewBoxWidth - paddingWidth]);

    const dataWidth = (viewBoxWidth - 2 * paddingWidth) / data.length;
    const dataBarWidth = 0.75 * dataWidth;
    const dataPaddingWidth = 0.25 * dataWidth;

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("data-date", d => d.date.toUTCString())
      .attr("data-gdp", d => d.gdp)
      .attr("x", (d, i) => scaleX(i) + dataPaddingWidth / 2)
      .attr("y", d => scaleY(d.gdp))
      .attr("width", dataBarWidth)
      .attr("height", d => scaleHeight(d.gdp))
      .on("mouseover", d => d3.select("#tooltip").text(tooltip(d)));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${viewBoxHeight - paddingHeight})`)
      .call(d3.axisBottom(scaleYears).tickFormat(d3.format("d")));

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${paddingWidth}, 0)`)
      .call(d3.axisLeft(scaleY));

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
