let imageSceneData;
let audioSceneData;
let captionData;
let videoInfo;

async function loadData() {
  videoInfo = await d3.json(mainDir + pathConfig.videoDataFilename);
  imageSceneData = await d3.json(mainDir + pathConfig.imageDataFilename);
  imageSceneData = imageSceneData.sort((a, b) => a["sceneNum"] - b["sceneNum"]);
  audioSceneData = await d3.json(mainDir + pathConfig.audioDataFilename);
  audioSceneData = audioSceneData.sort((a, b) => a["sceneNum"] - b["sceneNum"]);
  try {
    captionData = await d3.json(mainDir + "captions.json");
  } catch (e) {
    console.log("no captions");
  }
}

window.addEventListener("load", async () => {
  await loadData(); // only loads once
  console.log("DATA LOADED")
  console.log("IMAGE DATA", imageSceneData)
  handleRouteChange();
  
});

window.addEventListener("hashchange", handleRouteChange);

