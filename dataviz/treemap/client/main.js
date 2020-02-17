import * as d3 from "d3";

const url =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
const viewBoxWidth = 720;
const paddingWidth = 0.05 * viewBoxWidth;
const viewBoxHeight = 360;
const paddingHeight = 0.05 * viewBoxHeight;

function main() {
  d3.json(url).then(data => {
    d3.select("body")
      .append("h1")
      .attr("id", "title")
      .text("Top Kickstarter Projects");

    d3.select("body")
      .append("p")
      .attr("id", "description")
      .text("Funding Received in US Dollars");

    const figure = d3.select("body").append("figure");

    const svg = figure
      .append("svg")
      .attr("viewBox", [0, 0, viewBoxWidth, viewBoxHeight]);

    const tree = d3
      .treemap()
      .size([viewBoxWidth, viewBoxHeight])
      .padding(1)(
      d3
        .hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value)
    );

    const leaf = svg
      .selectAll("g")
      .data(tree.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

    leaf
      .append("rect")
      .attr("class", d => `tile ${category(d.data.category)}`)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .on("mouseover", d =>
        d3
          .select("#tooltip")
          .attr("data-value", d.data.value)
          .text(tooltip(d))
      );

    leaf
      .append("text")
      .attr("x", 1)
      .attr("y", 10)
      .text(d => `$${Math.round(d.data.value / 1000000)}m`);

    const legend = figure
      .append("svg")
      .attr("viewBox", [0, 0, viewBoxWidth, paddingHeight]);

    const legendItems = [
      "Product Design",
      "Tabletop Games",
      "Video Games",
      "Technology",
      "Hardware",
      "Other"
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
        .attr("class", `legend-item ${toClassName(legendItems[i])}`);

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
        .text(legendItems[i]);
    }

    figure.append("figcaption").attr("id", "tooltip");
  });
}

function tooltip(d) {
  return `${d.data.name}: $${d.data.value} (${d.data.category})`;
}

function category(s) {
  switch (s) {
    case "Product Design":
    case "Tabletop Games":
    case "Video Games":
    case "Technology":
    case "Hardware":
      return toClassName(s);
    default:
      return "other";
  }
}

function toClassName(s) {
  return s
    .toLowerCase()
    .split(" ")
    .join("-");
}

if (process.env.NODE_ENV !== "test") {
  main();
}
