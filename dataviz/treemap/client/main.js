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

    const scale = d3
      .scaleQuantile()
      .domain(
        tree
          .leaves()
          .map(d => d.data.value)
          .sort()
      )
      .range([...Array(5).fill("low"), ...Array(4).fill("medium"), "high"]);

    svg
      .selectAll("g")
      .data(tree.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
      .append("rect")
      .attr(
        "class",
        d => `tile ${category(d.data.category)} ${scale(d.data.value)}`
      )
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

    const legend = figure
      .append("svg")
      .attr("viewBox", [0, 0, viewBoxWidth, paddingHeight]);

    const legendItems = [
      {
        className: "technology high",
        text: "Technology"
      },
      {
        className: "art high",
        text: "Art"
      },
      {
        className: "other",
        text: "Other"
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
        .attr("class", `legend-item ${legendItems[i].className}`);

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

function tooltip(d) {
  return `${d.data.name}: $${d.data.value} (${d.data.category})`;
}

function category(s) {
  switch (s) {
    case "Product Design":
    case "Gaming Hardware":
    case "Hardware":
    case "3D Printing":
    case "Technology":
    case "Wearables":
    case "Technology":
    case "Food":
    case "Gadgets":
    case "Drinks":
      return "technology";
    case "Tabletop Games":
    case "Video Games":
    case "Sound":
    case "Television":
    case "Narrative Film":
    case "Web":
    case "Games":
    case "Sculpture":
    case "Apparel":
    case "Art":
      return "art";
    default:
      return "other";
  }
}

if (process.env.NODE_ENV !== "test") {
  main();
}
