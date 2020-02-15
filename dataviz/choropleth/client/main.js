import * as d3 from "d3";

const topologyURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const metadataURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const viewBoxWidth = 720;
const paddingWidth = 0.05 * viewBoxWidth;
const viewBoxHeight = 360;
const paddingHeight = 0.05 * viewBoxHeight;

function main() {
  getData(topologyURL, metadataURL).then(data => {
    d3.select("body")
      .append("h1")
      .attr("id", "title")
      .text("U.S. College Graduation Rate");

    d3.select("body")
      .append("p")
      .attr("id", "description")
      .text("");

    const figure = d3.select("body").append("figure");

    const svg = figure
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    const legend = figure
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxWidth} ${paddingHeight}`);

    const legendItems = [
      {
        className: "highly-ignorant",
        text: "Highly Ignorant"
      },
      {
        className: "ignorant",
        text: "Ignorant"
      },
      {
        className: "educated",
        text: "Educated"
      },
      {
        className: "highly-educated",
        text: "Highly Educated"
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

async function getData(topologyURL, metadataURL) {
  return {
    topology: await d3.json(topologyURL),
    metadata: new Map(
      (
        await d3.json(metadataURL)
      ).map(
        ({ fips, state, area_name: county, bachelorsOrHigher: graduated }) => [
          fips,
          { state, county, graduated }
        ]
      )
    )
  };
}

function tooltip(d) {
  return "";
}

if (process.env.NODE_ENV !== "test") {
  main();
}
