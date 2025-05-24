async function loadData() {
  allSceneData = [];
  for (const movieName of movies) {
    const mainDir = metaData[movieName].mainDir;
    data[movieName].videoInfo = await d3.json(
      mainDir + pathConfig.videoDataFilename
    );
    let imageSceneData = await d3.json(mainDir + pathConfig.imageDataFilename);

    data[movieName].imageSceneData = imageSceneData.sort(
      (a, b) => a["sceneNum"] - b["sceneNum"]
    );

    let audioSceneData = await d3.json(mainDir + pathConfig.audioDataFilename);
    data[movieName].audioSceneData = audioSceneData.sort(
      (a, b) => a["sceneNum"] - b["sceneNum"]
    );

    data[movieName].imageSceneData.forEach((d, i) => {
      allSceneData.push({
        ...d,
        movieName: movieName,
        imgDir: metaData[movieName].imgDir,
        audioDir: metaData[movieName].audioDir,
      });
    });
    data[movieName].numSamples = parseInt(data[movieName].videoInfo["samples"]);
    try {
      data[movieName].captionData = await d3.json(mainDir + "captions.json");
    } catch (e) {
      data[movieName].captionData = [[]];
      console.log("no captions");
    }
  }
}

window.addEventListener("load", async () => {
  await loadData(); // only loads once
  console.log("DATA LOADED");
  console.log(allSceneData);
  // console.log("IMAGE DATA", imageSceneData);
  // console.log("AUDIO DATA", audioSceneData);
  // console.log("CAPTION DATA", captionData);
  handleRouteChange();
});

window.addEventListener("hashchange", handleRouteChange);
