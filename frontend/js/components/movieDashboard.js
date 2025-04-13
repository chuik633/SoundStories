

function layoutDashboardAndPreview(container) {
  d3.select("#films-page").style("--shrinkSize", `${shrinkSize}px`); //sync it with the css
  d3.select("#films-page").style("--hoverImageSize", `${hoverImageSize}px`);
  d3.select("#films-page").style(
    "--selectedImageSize",
    `${selectedImageSize}px`
  );

  //the dashboard
  const dashboard = container.append("div").attr("class", "dashboard full");
  dashboard.append('h2').text('MOVIE TITLE')
  layoutDashboard(dashboard, imageSceneData);
 

  // the preview container
  const previewContainer = container
    .append("div")
    .attr("class", "preview-container small");

  //the video player
  const videoWrapper = previewContainer
    .append("div")
    .attr("class", "video-wrapper-outer small");

  //place in the background sketch
  const sketch_container = previewContainer
    .append("div")
    .attr("id", "sketches-container").attr('class', 'hidden')

  makeSingleVideoPlayer(videoWrapper, startSceneNum);
  changeDisplayedVideo(startSceneNum);

  //grow and shrink elements
  dashboard.on("click", () => expandDashboard());
  previewContainer.on("click", () => expandPreviewContainer());
}

//put motion and transitions into these?
function expandDashboard(){
  //shrink preview container
  d3.select(".preview-container").attr("class", "preview-container small");
  d3.select("#sketches-container").attr("class", "hidden");
  //grow shrink wrap
  d3.select(".video-wrapper-outer").attr("class", "video-wrapper-outer small");
  //grow dashboard
  d3.select(".dashboard").attr("class", "dashboard full");
}
function expandPreviewContainer() {
  d3.select(".preview-container").attr("class", "preview-container full")
   d3.select("#sketches-container").attr("class", "visible");
  d3.select(".video-wrapper-outer").attr("class", "video-wrapper-outer full");
  d3.select(".dashboard").attr("class", "dashboard small");
}


function layoutDashboard(dashboard) {
  dashboard.append('div').attr('class', 'plots-container')
  layoutScenePreviews(dashboard, imageSceneData);
}

function layoutScenePreviews(outer_container) {
  const container = outer_container
    .append("div")
    .attr("class", "scene-preview-container");
  for (const { filename, colors, sceneNum } of imageSceneData) {
    const sceneImg = container
      .append("img")
      .attr("class", `sceneImg sceneImg-${sceneNum}`)
      .attr("src", imgDir + filename)
      .attr("next", false)
      .attr("prev", false)
      .attr("selected", false);
    //TODO change this to make the scene selection
    sceneImg.on("click", () => {
      console.log("SELECTED:", sceneNum)
      changeDisplayedVideo(sceneNum);
      // showSketches(filename, sceneNum);
    });
  }
   
    
}

function changeDisplayedVideo(sceneNum){
  console.log('scene change')
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
  d3.select(".video-wrapper-outer").style("visibility", "hidden").style("opacity", 0);
  const selectedSceneImg = d3.select(`.sceneImg-${sceneNum}`).node();
  selectedSceneImg.addEventListener(
    "transitionend",
    () => {
      const rect = selectedSceneImg.getBoundingClientRect();
      d3.select(".video-wrapper-outer.small")
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
  d3.select("#displayed-video").attr("src", videoDir + sceneNum + ".mp4");
  d3.select("#displayed-video").attr("sceneNum", sceneNum);


  //update plots
  layoutPlots(sceneNum);
  //show the sketches
  showSketches(sceneNum); 
}




