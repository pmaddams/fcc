import * as d3 from "d3";
import * as topojson from "topojson-client";

const topologyURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const metadataURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const viewBoxWidth = 975;
const paddingWidth = 0.05 * viewBoxWidth;
const viewBoxHeight = 610;
const paddingHeight = 0.05 * viewBoxHeight;

function main() {
  getData(topologyURL, metadataURL).then(({ topology, metadata }) => {
    d3.select("body")
      .append("h1")
      .attr("id", "title")
      .text("U.S. College Graduation Rate");

    d3.select("body")
      .append("p")
      .attr("id", "description")
      .text("Percentage of Adults with Bachelor's Degree or Higher by County");

    const figure = d3.select("body").append("figure");

    const svg = figure
      .append("svg")
      .attr("viewBox", [0, 0, viewBoxWidth, viewBoxHeight]);

    const path = d3.geoPath();

    const scale = d3
      .scaleQuantile()
      .domain(
        Array.from(metadata.values())
          .map(v => v.graduated)
          .sort()
      )
      .range([
        ...Array(5).fill("highly-ignorant"),
        ...Array(2).fill("ignorant"),
        ...Array(2).fill("educated"),
        "highly-educated"
      ]);

    svg
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(topology, topology.objects.counties).features)
      .join("path")
      .attr("class", d => `county ${scale(metadata.get(d.id).graduated)}`)
      .attr("d", path)
      .attr("data-fips", d => d.id)
      .attr("data-education", d => metadata.get(d.id).graduated)
      .on("mouseover", d =>
        d3
          .select("#tooltip")
          .attr("data-education", metadata.get(d.id).graduated)
          .text(tooltip(metadata.get(d.id)))
      );

    svg
      .append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(topojson.feature(topology, topology.objects.states).features)
      .join("path")
      .attr("class", "state")
      .attr("d", path);

    const legend = figure
      .append("svg")
      .attr("viewBox", [0, 0, viewBoxWidth, paddingHeight]);

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

function tooltip({ state, county, graduated }) {
  return `${county}, ${state}: ${graduated}%`;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
