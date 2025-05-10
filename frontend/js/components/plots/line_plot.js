/**
 * val should be for every sample, show it aveaged for the condensed scenes,
 * slightly bigger for the nearby ones, and big for the current
 */
let hover_square;
function dynamicPlot(
  dashboard,
  val,
  plot_width,
  plot_height,
  movieName,
  sceneNum
) {
  hover_square = dashboard
    .append("div")
    .style(
      "border",
      `.5px solid ${d3.select("#films-page").style("--text-color")}`
    )
    .attr("class", "hidden")
    .style("position", "absolute")
    .style("top", "30px")
    .style("left", "0px")
    .style("z-index", `5`)
    .style("width", `10px`)
    .style("height", `${(plot_height * 2) / 3}px`);
  //   const sceneNum = d3.select("#displayed-video").attr("sceneNum");

  const list_vals = data[movieName].audioSceneData.map((d) => d[val]);
  const list_len = list_vals[0].length;

  const flatVals = data[movieName].audioSceneData.flatMap((d) => d[val]);
  const minVal = d3.min(flatVals);
  const maxVal = d3.max(flatVals);

  const smallChunkSize = Math.min(50, list_len);
  const hoverChunkSize = Math.min(10, smallChunkSize);
  const chunk = (arr, size) =>
    arr.reduce(
      (acc, _, i) => (i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc),
      []
    );
  const avg = (arr) => d3.mean(arr);

  const prePrevVals = chunk(
    flatVals.slice(0, (sceneNum - 1) * list_len),
    smallChunkSize
  ).map(avg);
  const prevVals = chunk(
    flatVals.slice((sceneNum - 1) * list_len, sceneNum * list_len),
    hoverChunkSize
  ).map(avg);
  const currVals = flatVals.slice(
    sceneNum * list_len,
    (sceneNum + 1) * list_len
  );
  const nextVals = chunk(
    flatVals.slice((sceneNum + 1) * list_len, (sceneNum + 2) * list_len),
    hoverChunkSize
  ).map(avg);
  const afterNextVals = chunk(
    flatVals.slice((sceneNum + 2) * list_len),
    smallChunkSize
  ).map(avg);

  //single scene for the flat mat
  const numSmallScenes = data[movieName].numSamples - 3;
  const remaining_width = plot_width - hoverImageSize * 2 - selectedImageSize;

  const xScale1 = d3
    .scaleLinear()
    .domain([0, prePrevVals.length - 1 + afterNextVals.length - 1])
    .range([0, remaining_width]);
  const smallSceneW = remaining_width / numSmallScenes;
  const xScale2 = d3
    .scaleLinear()
    .domain([0, prevVals.length - 1 + nextVals.length - 1])
    .range([0, 2 * hoverImageSize]);
  const xScale3 = d3
    .scaleLinear()
    .domain([0, currVals.length - 1])
    .range([0, selectedImageSize]);
  //i want a single scale that maps the

  const yScale = d3
    .scaleLog()
    .domain([minVal, maxVal])
    .range([plot_height - plotPadding.bottom, plotPadding.top]);

  // SVG STUFF AND HOVERING
  const svg = dashboard
    .append("svg")
    .attr("width", plot_width)
    .attr("height", plot_height);

  const sceneFromChunkIndex = (chunkIndex, chunkSize) =>
    Math.floor((chunkIndex * chunkSize) / list_len);

  function getSceneNumfromX(x) {
    let pre_prev_x = xScale1(prePrevVals.length - 1);
    if (x < pre_prev_x) {
      let idx = Math.floor(xScale1.invert(x));
      return sceneFromChunkIndex(idx, smallChunkSize);
    } else if (x < pre_prev_x + hoverImageSize) {
      return sceneNum - 1;
    } else if (x < pre_prev_x + hoverImageSize + selectedImageSize) {
      return sceneNum;
    } else if (x < pre_prev_x + 2 * hoverImageSize + selectedImageSize) {
      return sceneNum + 1;
    } else {
      let localX = x - (pre_prev_x + 2 * hoverImageSize + selectedImageSize);
      let idx = Math.floor(xScale1.invert(localX));
      return sceneNum + 2 + sceneFromChunkIndex(idx, smallChunkSize);
    }
  }

  function getSceneStartX(scn) {
    const prePrevChunkCount = Math.ceil(
      ((sceneNum - 1) * list_len) / smallChunkSize
    );
    const prePrevWidth = xScale1(prePrevChunkCount);
    const prevWidth = hoverImageSize;
    const currWidth = selectedImageSize;
    const nextWidth = hoverImageSize;

    if (scn < sceneNum - 1) {
      const idx = Math.floor((scn * list_len) / smallChunkSize);
      return xScale1(idx);
    } else if (scn === sceneNum - 1) {
      return prePrevWidth;
    } else if (scn === sceneNum) {
      return prePrevWidth + prevWidth;
    } else if (scn === sceneNum + 1) {
      return prePrevWidth + prevWidth + currWidth;
    } else {
      const idx = Math.floor(
        ((scn - (sceneNum + 2)) * list_len) / smallChunkSize
      );
      return prePrevWidth + prevWidth + currWidth + nextWidth + xScale1(idx);
    }
  }

  svg.style("pointer-events", "all");
  hover_square.style("pointer-events", "none");
  svg.selectAll("*").style("pointer-events", "none");
  svg.on("mousemove", function (event) {
    const [x] = d3.pointer(event, this);
    //get the corresponding scene to the hover
    let hoverSceneNum = getSceneNumfromX(x);
    hoverLinePlot(hoverSceneNum);
    highlightNoteScene(hoverSceneNum);
  });
  svg.on("click", function (event) {
    const [x] = d3.pointer(event, this);
    let hoverSceneNum = getSceneNumfromX(x);
    console.log("clicke", hoverSceneNum);
    changeDisplayedVideo(movieName, hoverSceneNum);
  });

  //before prev square
  let curr_x = 0;
  svg
    .append("path")
    .datum(prePrevVals)

    .attr("fill", "none")
    .attr("stroke", d3.select("#films-page").style("--text-color"))
    .attr("opacity", 0.3)
    .attr("stroke-width", 0.5)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => xScale1(i))
        .y((d) => yScale(d))
    );
  curr_x = xScale1(prePrevVals.length - 1);

  //hover plots
  svg
    .append("path")
    .datum(prevVals)
    .attr("fill", "none")
    .attr("class", `line-plot-line line-plot-line-${sceneNum - 1}`)
    .attr("stroke", d3.select("#films-page").style("--text-color"))
    .attr("opacity", 0.5)
    .attr("stroke-width", 0.5)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => curr_x + xScale2(i))
        .y((d) => yScale(d))
    );
  curr_x += hoverImageSize;

  svg
    .append("path")
    .datum(currVals)
    .attr("fill", "none")
    .attr("stroke", d3.select("#films-page").style("--text-color"))
    .attr("class", `line-plot-line line-plot-line-${sceneNum}`)
    .attr("stroke-width", 0.5)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => curr_x + xScale3(i))
        .y((d) => yScale(d))
    );
  curr_x += selectedImageSize;

  svg
    .append("path")
    .datum(nextVals)
    .attr("fill", "none")
    .attr("stroke", d3.select("#films-page").style("--text-color"))
    .attr("class", `line-plot-line line-plot-line-${sceneNum + 1}`)
    .attr("opacity", 0.5)
    .attr("stroke-width", 0.8)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => curr_x + xScale2(i))
        .y((d) => yScale(d))
    );
  curr_x += hoverImageSize;

  svg
    .append("path")
    .datum(afterNextVals)

    .attr("fill", "none")
    .attr("stroke", d3.select("#films-page").style("--text-color"))
    .attr("opacity", 0.3)
    .attr("stroke-width", 0.5)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => curr_x + xScale1(i))
        .y((d) => yScale(d))
    );

  function hoverLinePlot(hoverSceneNum) {
    hover_square.attr("class", "visible");
    // hover_line.style('left', `${x}px`)
    if (hoverSceneNum == sceneNum) {
      hover_square.style("width", `${selectedImageSize}px`);
    } else if (hoverSceneNum == sceneNum - 1 || hoverSceneNum == sceneNum + 1) {
      hover_square.style("width", `${hoverImageSize}px`);
    } else {
      hover_square.style("width", `${smallSceneW}px`);
    }
    hover_square.style("left", `${getSceneStartX(hoverSceneNum)}px`);
  }

  return hoverLinePlot;
}
