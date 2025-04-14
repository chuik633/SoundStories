/**
 * archid
 */

function oneValPerScenePlot(dashboard, val, plot_width, plot_height) {
  const vals = audioSceneData.map((d) => d[val]);
  console.log(vals);
  const minVal = d3.min(vals);
  const maxVal = d3.max(vals);
  console.log(minVal, maxVal);

  //x scale is the sample
  const xScale = d3
    .scaleLinear()
    .domain([0, numSamples])
    .range([plotPadding.left, plot_width - plotPadding.right]);

  const yScale = d3
    .scaleLinear()
    .domain([minVal, maxVal])
    .range([plot_height - plotPadding.bottom, plotPadding.top]);

  const svg = dashboard
    .append("svg")
    .attr("width", plot_width)
    .attr("height", plot_height);
  svg
    .append("path")
    .datum(audioSceneData)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => xScale(i))
        .y((d) => yScale(d[val]))
    );
}

function allValsPerScenePlot(dashboard, val, plot_width, plot_height) {
  const flatVals = audioSceneData.flatMap((d) => d[val]);

  const minVal = d3.min(flatVals);
  const maxVal = d3.max(flatVals);
  console.log(minVal, maxVal);

  //x scale is the sample
  const xScale = d3
    .scaleLinear()
    .domain([0, flatVals.length - 1])
    .range([plotPadding.left, plot_width - plotPadding.right]);

  const yScale = d3
    .scaleLinear()
    .domain([minVal, maxVal])
    .range([plot_height - plotPadding.bottom, plotPadding.top]);

  const svg = dashboard
    .append("svg")
    .attr("width", plot_width)
    .attr("height", plot_height);
  svg
    .append("path")
    .datum(flatVals)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => xScale(i))
        .y((d) => yScale(d))
    );
}
