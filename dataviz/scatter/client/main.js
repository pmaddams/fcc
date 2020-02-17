import * as d3 from "d3";

const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const viewBoxWidth = 720;
const paddingWidth = 0.05 * viewBoxWidth;
const viewBoxHeight = 360;
const paddingHeight = 0.05 * viewBoxHeight;

function main() {
  getData(url).then(data => {
    d3.select("body")
      .append("h1")
      .attr("id", "title")
      .text("Doping in Professional Cycling");

    const figure = d3.select("body").append("figure");

    const svg = figure
      .append("svg")
      .attr("viewBox", [0, 0, viewBoxWidth, viewBoxHeight]);

    const scaleX = d3
      .scaleLinear()
      .domain([d3.min(data, d => d.year) - 1, d3.max(data, d => d.year) + 1])
      .range([paddingWidth, viewBoxWidth - paddingWidth]);

    const scaleY = d3
      .scaleLinear()
      .domain([
        0.99 * d3.min(data, d => d.time),
        1.01 * d3.max(data, d => d.time)
      ])
      .range([viewBoxHeight - paddingHeight, paddingHeight]);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${viewBoxHeight - paddingHeight})`)
      .call(d3.axisBottom(scaleX).tickFormat(d3.format("d")));

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${paddingWidth}, 0)`)
      .call(
        d3
          .axisLeft(scaleY)
          .tickFormat(secondsToMinutes)
          .tickSize(-(viewBoxWidth - 2 * paddingWidth))
          .tickSizeOuter(0)
      );

    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("class", d => {
        if (d.doping) {
          return "dot doping";
        } else {
          return "dot";
        }
      })
      .attr("data-xvalue", d => d.year)
      .attr("data-yvalue", d => d.time)
      .attr("cx", d => scaleX(d.year))
      .attr("cy", d => scaleY(d.time))
      .attr("r", 1)
      .on("mouseover", d =>
        d3
          .select("#tooltip")
          .attr("data-year", d.year)
          .text(tooltip(d))
      );

    figure.append("figcaption").attr("id", "tooltip");
  });
}

async function getData(url) {
  return (await d3.json(url)).map(({ Seconds, Name, Year, Doping }) => ({
    time: Seconds,
    name: Name,
    year: Year,
    doping: Doping !== ""
  }));
}

function tooltip(d) {
  return `${secondsToMinutes(d.time)} (${d.name}, ${
    d.doping ? "" : "not "
  }caught doping)`;
}

function secondsToMinutes(n) {
  return `${Math.floor(n / 60)}:${d3.format("02d")(n % 60)}`;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
