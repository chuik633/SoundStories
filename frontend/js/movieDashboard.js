
async function loadData() {

  let imageSceneData = await d3.json(mainDir + pathConfig.imageDataFilename);
  imageSceneData = imageSceneData.sort((a, b) => a["sceneNum"] - b["sceneNum"]);
  let audioSceneData = await d3.json(mainDir + "audioSceneData.json");
  audioSceneData = audioSceneData.sort((a, b) => a["sceneNum"] - b["sceneNum"]);
  const captionData = await d3.json(mainDir + "captions.json");
  const videoInfo = await d3.json(mainDir + "videoInfo.json");
  videoUtils = videoInfo;
  console.log("got data");
  console.log("previewing");
  console.log(captionData);
  console.log(imageSceneData)
  layoutDashboard(imageSceneData, audioSceneData, captionData);
}

function layoutDashboard(imageSceneData, audioSceneData, captionData) {
  const app = d3.select("#app");
  const dashboard = app.append("div").attr("class", "dashboard small");
  const previewArea = app
    .append("div")
    .attr("class", "video-wrapper-outer full");

  // make the video player
  const startScene = 8
  makeSingleVideoPlayer(
    previewArea,
    8,
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
      const sketch_container = d3.select(".video-sketch-container");
      sketch_container.selectAll("*").remove();
      console.log("new scene");
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
    });
  }
}

function layoutFullSignalPlot(outer_container, audioSceneData) {}

loadData();
