import * as d3 from "d3";

const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const viewBoxWidth = 720;
const paddingWidth = 0.05 * viewBoxWidth;
const viewBoxHeight = 360;
const paddingHeight = 0.05 * viewBoxHeight;

function main() {
  getData(url).then(data => {
    d3.select("body")
      .append("h1")
      .attr("id", "title")
      .text("Global Surface Temperature");

    d3.select("body")
      .append("p")
      .attr("id", "description")
      .text("Average, Land and Sea (°C)");

    const figure = d3.select("body").append("figure");

    const svg = figure
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    const scaleX = d3
      .scaleLinear()
      .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
      .range([paddingWidth, viewBoxWidth - paddingWidth]);

    const scaleY = d3
      .scaleLinear()
      .domain([0, 12])
      .range([paddingHeight, viewBoxHeight - paddingHeight]);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${viewBoxHeight - paddingHeight})`)
      .call(d3.axisBottom(scaleX).tickFormat(d3.format("d")));

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${paddingWidth}, 0)`)
      .call(d3.axisLeft(scaleY).tickFormat(monthName));

    const dataWidth =
      (viewBoxWidth - 2 * paddingWidth) /
      (data[data.length - 1].year - data[0].year);
    const dataHeight = (viewBoxHeight - 2 * paddingHeight) / 12;

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr(
        "class",
        d =>
          `cell ${d3
            .scaleQuantile()
            .domain(data.map(d => d.temp))
            .range(["low", "medium", "high", "extreme"])(d.temp)}`
      )
      .attr("data-month", d => d.month)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => d.temp)
      .attr("x", d => scaleX(d.year))
      .attr("y", d => scaleY(d.month))
      .attr("width", dataWidth)
      .attr("height", dataHeight)
      .on("mouseover", d =>
        d3
          .select("#tooltip")
          .attr("data-year", d.year)
          .text(tooltip(d))
      );

    const legend = figure
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxWidth} ${paddingHeight}`);

    const legendItems = [
      {
        className: "low",
        text: "Low"
      },
      {
        className: "medium",
        text: "Medium"
      },
      {
        className: "high",
        text: "High"
      },
      {
        className: "extreme",
        text: "Extreme"
      }
    ];

    const legendItemWidth = viewBoxWidth / legendItems.length;

    const legendRectSize = 0.5 * paddingHeight;

    const legendPadding = 0.5 * legendRectSize;

    for (let i = 0; i < legendItems.length; i++) {
      legend
        .append("rect")
        .attr("x", paddingWidth + i * legendItemWidth + legendPadding)
        .attr("y", legendPadding)
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .attr("class", legendItems[i].className);

      legend
        .append("text")
        .attr(
          "x",
          paddingWidth +
            i * legendItemWidth +
            2 * legendPadding +
            legendRectSize
        )
        .attr("y", legendPadding + 0.85 * legendRectSize)
        .attr("font-size", legendRectSize)
        .text(legendItems[i].text);
    }

    figure.append("figcaption").attr("id", "tooltip");
  });
}

async function getData(url) {
  const data = await d3.json(url);
  return data.monthlyVariance.map(({ year, month, variance }) => ({
    year,
    month: month - 1,
    temp: data.baseTemperature + variance
  }));
}

function tooltip(d) {
  return `${monthName(d.month)} ${d.year}: ${d.temp} °C`;
}

function monthName(n) {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ][n];
}

if (process.env.NODE_ENV !== "test") {
  main();
}
