

function layoutDashboard(imageSceneData, audioSceneData, captionData) {
  const app = d3.select("#app");
  const dashboard = app.append("div").attr("class", "dashboard small");
  const previewArea = app
    .append("div")
    .attr("class", "video-wrapper-outer full");

  // make the video player
  makeSingleVideoPlayer(
    previewArea,
    1,
    imageSceneData,
    audioSceneData,
    captionData
  );

  //expand preview
  d3.select(".video-wrapper-outer").on("click", () => {
    previewArea.attr("class", "video-wrapper-outer full");
    dashboard.attr("class", "dashboard small");
  });

  d3.select(".dashboard").on("click", () => {
    previewArea.attr("class", "video-wrapper-outer small");
    dashboard.attr("class", "dashboard full");
  });

  //layout dashboard
  layoutScenePreviews(dashboard, imageSceneData, audioSceneData, captionData);
}

function layoutScenePreviews(
  outer_container,
  imageSceneData,
  audioSceneData,
  captionData
) {
  const container = outer_container
    .append("div")
    .attr("class", "scene-preview-container wide");
  for (const { filename, colors, sceneNum } of imageSceneData) {
    const sceneImg = container.append("img").attr("src", imgDir + filename);
    //TODO change this to make the scene selection
    sceneImg.on("click", () => {
      d3.select("#displayed-video").attr("src", videoDir + sceneNum + ".mp4");
      d3.select("#displayed-video").attr("sceneNum", sceneNum);
      // showSketches(filename, sceneNum);
    });
  }
}

//where you put all the sketch display stuff
function showSketches(filename,sceneNum) {
  const sketch_container = d3.select(".video-sketch-container");
  sketch_container.selectAll("*").remove();
  new p5((p) =>
    sketchTest(
      p,
      sketch_container.node(),
      imgDir + filename,
      colors,
      audioSceneData[sceneNum],
      captionData[sceneNum]
    )
  );
}


function layoutFullSignalPlot(outer_container, audioSceneData) {}


