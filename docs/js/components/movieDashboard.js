function layoutDashboardAndPreview(
  container,
  movieName,
  sceneNum,
  dashboard_mode
) {
  console.log("laying out dashboard", movieName);
  console.log(data[movieName]);
  d3.select("#films-page").style("--shrinkSize", `${shrinkSize}px`); //sync it with the css
  d3.select("#films-page").style("--hoverImageSize", `${hoverImageSize}px`);
  d3.select("#films-page").style(
    "--selectedImageSize",
    `${selectedImageSize}px`
  );

  //the dashboard
  const dashboard = container
    .append("div")
    .attr("class", "dashboard full")
    .attr("id", `dashboard-${movieName}`);
  dashboard.append("h2").text(" ");
  dashboard.append("div").attr("class", "plots-container");
  layoutScenePreviews(container, movieName);

  //the preview
  const previewContainer = layoutPreview(container, sceneNum, movieName);

  //grow and shrink elements
  // dashboard.on("click", () => expandDashboard());
  console.log(sceneNum);
  d3.select("#displayed-video").attr("sceneNum", sceneNum + 1);
  changeDisplayedVideo(movieName, sceneNum);
  if (dashboard_mode) {
    expandDashboard(movieName);
  } else {
    expandPreviewContainer(movieName);
  }
}

function layoutPreview(container, sceneNum, movieName) {
  const previewContainer = container
    .append("div")
    .attr("class", "preview-container full");

  //the video player
  const videoWrapper = previewContainer
    .append("div")
    .attr("class", "video-wrapper-outer full");
  videoWrapper.append("div").attr("class", "bottom-container visible");
  makeBottomContainer(sceneNum, movieName);

  //place in the background sketch
  const sketch_container = previewContainer
    .append("div")
    .attr("id", "sketches-container")
    .attr("class", "hidden");
  makeSingleVideoPlayer(videoWrapper, movieName, sceneNum);
  return previewContainer;
}

//put motion and transitions into these?
function expandDashboard() {
  console.log("expand dashboard function");

  //shrink preview container
  const movieName = d3.select("#displayed-video").attr("movieName");
  const sceneNum = d3.select("#displayed-video").attr("sceneNum");
  d3.select(".preview-container").attr("class", "preview-container small");

  // the buttons

  d3.select(".dashboard.small").on("click", () => null);
  console.log(d3.select(".small.preview-container"));
  d3.select(".small.preview-container").on("click", () => {
    console.log("HERE");
    expandPreviewContainer(movieName);
  });
  // .style(
  //   "background-image",
  //   `url(${metaData[movieName].imgDir}${sceneNum}-005.png)`
  // );
  d3.select("#sketches-container").attr("class", "hidden");
  d3.select(".scene-preview-container").attr(
    "class",
    "scene-preview-container full"
  );
  //grow shrink wrap
  d3.select(".video-wrapper-outer").attr("class", "video-wrapper-outer small");
  d3.select(".video-wrapper-outer .bottom-container").attr(
    "class",
    "bottom-container hidden"
  );
  //grow dashboard
  d3.select(".dashboard")
    .attr("class", "dashboard full")
    .style("background-image", `none`);
}
function expandPreviewContainer(movieName) {
  d3.select(".preview-container").attr("class", "preview-container full");
  d3.select("#sketches-container").attr("class", "visible");
  d3.select(".scene-preview-container").attr(
    "class",
    "scene-preview-container small hidden"
  );
  d3.select(".video-wrapper-outer")
    .select(".bottom-container")
    .attr("class", "bottom-container visible");

  d3.select(".video-wrapper-outer").attr(
    "class",
    "video-wrapper-outer full visible"
  );

  const sceneNum = d3.select("#displayed-video").attr("sceneNum");
  d3.select(".dashboard").attr("class", "dashboard small");
  // .style(
  //   "background-image",
  //   `url(${metaData[movieName].imgDir}${sceneNum}-005.png)`
  // );
  makeBottomContainer(sceneNum, movieName);

  // the buttons
  console.log("expand preview container");
  d3.select(".preview-container").on("click", null);
  d3.select(".dashboard.small").on("click", () => expandDashboard());

  showSketches(movieName, sceneNum);
  showInstruments(d3.select("#instrument-plotcontainer"), movieName, sceneNum);
}

function layoutDashboard(dashboard, movieName) {
  dashboard.append("div").attr("class", "plots-container");
  // changeDisplayedVideo(
  //   movieName,
  //   d3.select("#displayed-video").attr("sceneNum")
  // );
  layoutScenePreviews(dashboard, movieName);
}

function layoutScenePreviews(outer_container, movieName) {
  const container = outer_container
    .append("div")
    .attr("class", "scene-preview-container small");
  // console.log(data);
  for (let sceneNum = 0; sceneNum < data[movieName].numSamples; sceneNum++) {
    const filename = `${sceneNum}-001.png`;
    const sceneImg = container
      .append("img")
      .attr("class", `sceneImg sceneImg-${sceneNum}`)
      .attr("src", metaData[movieName].imgDir + filename)
      .attr("next", false)
      .attr("prev", false)
      .attr("selected", false);
    //TODO change this to make the scene selection
    sceneImg.on("click", () => {
      changeDisplayedVideo(movieName, sceneNum);
    });
  }
  // for (const { filename, colors, sceneNum } of data[movieName].imageSceneData) {
  //   const sceneImg = container
  //     .append("img")
  //     .attr("class", `sceneImg sceneImg-${sceneNum}`)
  //     .attr("src", metaData[movieName].imgDir + filename)
  //     .attr("next", false)
  //     .attr("prev", false)
  //     .attr("selected", false);
  //   //TODO change this to make the scene selection
  //   sceneImg.on("click", () => {
  //     changeDisplayedVideo(movieName, sceneNum);
  //   });
  // }
}

function changeDisplayedVideo(movieName, sceneNum) {
  console.log("CHANGE VIDEO");

  if (d3.select("#displayed-video").attr("sceneNum") == sceneNum) {
    console.log("same video", sceneNum);
    return;
  }
  const numSamples = data[movieName].numSamples;
  //RESIZE ALL OF THE IMAGES IN THE PREVIEW
  d3.selectAll(".sceneImg").attr("selected", false);
  d3.selectAll(".sceneImg").attr("prev", false);
  d3.selectAll(".sceneImg").attr("next", false);
  d3.select(`.sceneImg-${sceneNum}`).attr("selected", true);
  d3.select(`.sceneImg-${sceneNum - 1}`).attr("prev", true);
  d3.select(`.sceneImg-${sceneNum + 1}`).attr("next", true);

  let remainingW, imgW;
  if (sceneNum != 0 && sceneNum != numSamples - 1) {
    //cuz now two hovers for the near by ones
    remainingW =
      window.innerWidth -
      20 -
      2 * hoverImageSize -
      selectedImageSize -
      numSamples * 0.5;
    imgW = remainingW / (numSamples - 2);
  } else {
    remainingW =
      window.innerWidth -
      20 -
      hoverImageSize -
      selectedImageSize -
      numSamples * 0.5;
    imgW = remainingW / (numSamples - 3);
  }
  d3.select("#films-page").style("--prevImageSize", `${imgW}px`);

  //PLACE THE VIDEO WRAPPER WHERE THE SLEECTED IMAGE IS
  // d3.select(".video-wrapper-outer")
  //   .style("visibility", "hidden")
  //   .style("opacity", 0);
  const selectedSceneImg = d3.select(`.sceneImg-${sceneNum}`).node();
  selectedSceneImg.addEventListener(
    "transitionend",
    () => {
      const rect = selectedSceneImg.getBoundingClientRect();
      console.log("setting visibility");
      d3.select(".video-wrapper-outer")
        .style("height", `${rect.height}px`)
        .style("width", `${selectedVideoSize}px`)
        .style("top", `${rect.top + window.scrollY}px`)
        .style("visibility", "visible")
        .style("opacity", 1)
        .style("left", `${rect.left + window.scrollX - overlap}px`);
    },
    { once: true }
  );

  //set the displayed video
  d3.select("#displayed-video").attr(
    "src",
    metaData[movieName].videoDir + sceneNum + ".mp4"
  );
  d3.select("#displayed-video").attr("sceneNum", sceneNum);

  //update plots
  layoutPlots(movieName, sceneNum);

  //show the sketches
  console.log("change displayed video");
  showSketches(movieName, sceneNum);
}

function makeBottomContainer(sceneNum, movieName) {
  const container = d3.select(".bottom-container");
  console.log(container);
  container.selectAll("*").remove();
  const captionParamContainer = container
    .append("div")
    .attr("class", "section");

  //label the caption
  const c1 = captionParamContainer.append("div").attr("class", "subsection");
  c1.append("div").attr("class", "label").text("CAPTION");
  c1.append("input")
    .attr("autocomplete", "off")
    .attr("id", "caption-text")
    .property("value", "captiontext");

  //select the caption type

  const c2 = captionParamContainer.append("div").attr("class", "subsection");
  c2.append("div").attr("class", "label").text("TEXT TYPE");
  const options = ["flow", "blur", "swirl", "strings", "wiggly"];
  const radioGroup = c2.append("div").attr("class", "radio-group");
  options.forEach((opt, i) => {
    const label = radioGroup.append("label").attr("for", `text-type-${i}`);
    label
      .append("input")
      .attr("type", "radio")
      .attr("name", "text-type")
      .attr("id", `text-type-${i}`)
      .attr("value", opt)
      .property("checked", i === 0);
    label.append("span").text(opt);
  });
  //set up color mode
  const c5 = captionParamContainer.append("div").attr("class", "subsection");
  c5.append("div").attr("class", "label").text("COLOR MODE");
  const bgModeRadioGroup = c5.append("div").attr("class", "radio-group");
  ["simple", "sync with image"].forEach((opt, i) => {
    const label = bgModeRadioGroup
      .append("label")
      .attr("for", `sketch-bgMode-${i}`);
    label
      .append("input")
      .attr("type", "radio")
      .attr("name", "sketch-bgMode")
      .attr("id", `sketch-bgMode-${i}`)
      .attr("value", opt)
      .property("checked", i === 0);
    label.append("span").text(opt);
  });
  const c6 = captionParamContainer.append("div").attr("class", "subsection");
  c6.append("div").attr("class", "label").text("FADE");
  c6.append("input")
    .attr("type", "checkbox")
    .attr("class", "hidden my-toggle")
    .attr("id", "fade-mode");
  c6.append("label").attr("for", "fade-mode").attr("class", "toggle");

  //select the feature
  const pltoContainer2 = container.append("div").attr("class", "section");
  const c4 = pltoContainer2.append("div").attr("class", "subsection");
  c4.append("div").attr("class", "label ").text("AUDIO INPUT");
  const audioRadioGroup = c4.append("div").attr("class", "radio-group");
  ["mfcc", "chroma"].forEach((opt, i) => {
    const label = audioRadioGroup
      .append("label")
      .attr("for", `audio-feature-${i}`);
    label
      .append("input")
      .attr("type", "radio")
      .attr("name", "audio-feature")
      .attr("id", `audio-feature-${i}`)
      .attr("value", opt)
      .property("checked", i === 0);
    label.append("span").text(opt);
  });

  //toggle dark mode or light mode
  const c3 = pltoContainer2.append("div").attr("class", "subsection");
  c3.append("div").attr("class", "label ").text("DARK MODE");
  c3.append("input")
    .attr("type", "checkbox")
    .attr("class", "hidden my-toggle")
    .attr("id", "light-mode")
    .on("change", function () {
      const on = d3.select(this).property("checked");
      d3.select("body").classed("light-mode", on);
      if (on) {
        d3.selectAll(".icon").style("filter", "invert(100%");
        d3.select("#films-page")
          .style("--text-color", "black")
          .style("--bgColor", "#EFEDE3");
      } else {
        d3.selectAll(".icon").style("filter", "none");
        d3.select("#films-page")
          .style("--text-color", "#EFEDE3")
          .style("--bgColor", "black");
      }
    });
  c3.append("label").attr("for", "light-mode").attr("class", "toggle");

  //create the instrument plot section
  const plotContainer3 = container
    .append("div")
    .attr("class", "section")
    .style("padding", "0px")
    .attr("id", "instrument-plotcontainer");

  showInstruments(plotContainer3, movieName, sceneNum);
  // const cPlotW = pltoContainer2.node().getBoundingClientRect().width;
  // const cPlotH = 100;
  // const bins = [...Array(12).keys()].map((i) => i + 1);
  // const mfccSVG = cPLot
  //   .append("svg")
  //   .attr("width", cPlotW)
  //   .attr("height", cPlotH);
  // const xScale = d3.scaleBand().domain(bins).range([0, cPlotW]);
  // const yScale = d3.scaleLinear().domain([0, 1]).range([0, cPlotH]);
  // mfccSVG
  //   .selectAll(".mfcc-rect")
  //   .data(bins)
  //   .enter()
  //   .append("rect")
  //   .attr("class", "mfcc-rect")
  //   .attr("fill", d3.select("#films-page").style("--text-color"))
  //   .attr("x", (d) => xScale(d))
  //   .attr("y", (d) => cPlotH - yScale(0.5))
  //   .attr("width", xScale.bandwidth())
  //   .attr("height", yScale(0.5));
}
function updateBottomContainer() {}
