function layoutDashboardAndPreview(
  container,
  movieName,
  sceneNum,
  dashboard_mode
) {
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
  dashboard.on("click", () => expandDashboard());
  previewContainer.on("click", () => expandPreviewContainer(movieName));
  if (dashboard_mode) {
    expandDashboard();
  } else {
    expandPreviewContainer(movieName);
  }
  changeDisplayedVideo(movieName, sceneNum);
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
  makeBottomContainer();
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
  //shrink preview container
  d3.select(".preview-container").attr("class", "preview-container small");
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
  makeBottomContainer();
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

  showSketches(movieName, sceneNum);
}

function layoutDashboard(dashboard, movieName) {
  dashboard.append("div").attr("class", "plots-container");
  layoutScenePreviews(dashboard, movieName);
}

function layoutScenePreviews(outer_container, movieName) {
  const container = outer_container
    .append("div")
    .attr("class", "scene-preview-container small");
  // console.log(data);
  for (const { filename, colors, sceneNum } of data[movieName].imageSceneData) {
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
}

function changeDisplayedVideo(movieName, sceneNum) {
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
  showSketches(movieName, sceneNum);
}

function makeBottomContainer() {
  const container = d3.select(".bottom-container");
  console.log(container);
  container.selectAll("*").remove();
  const captionParamContainer = container
    .append("div")
    .attr("class", "section");

  //label the caption
  const c1 = captionParamContainer.append("div").attr("class", "subsection");
  c1.append("div").attr("class", "label").text("CAPTION");
  c1.append("div").attr("id", "caption-text").text("caption text");

  //select the caption type
  const pltoContainer2 = container.append("div").attr("class", "section");
  const c2 = pltoContainer2.append("div").attr("class", "subsection");
  c2.append("div").attr("class", "label").text("TEXT TYPE");
  const options = ["blur", "flow1", "flow2", "strings", "wiggly"];
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

  d3.selectAll('input[name="text-type"]').on("change", function (event) {
    const selectedValue = this.value;
    console.log("Selected text type:", selectedValue);
    // …or call your handler:
    // handleTextTypeChange(selectedValue);
  });
}
function updateBottomContainer() {}
