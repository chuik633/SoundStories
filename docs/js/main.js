async function loadData() {
  movies = await listMovies();
  setupMetaData();
  let moviesFailed = [];

  layoutMenu();
  for (const movieName of movies) {
    try {
      const videoUrl = getUrl(movieName, pathConfig.videoDataFilename);
      const videoInfo = await d3.json(videoUrl);

      const imgUrl = getUrl(movieName, pathConfig.imageDataFilename);
      const imageSceneData = await d3.json(imgUrl);

      const audioUrl = getUrl(movieName, pathConfig.audioDataFilename);
      const audioSceneData = await d3.json(audioUrl);

      let captionData = [];
      try {
        const captionUrl = getUrl(movieName, pathConfig.captionsFilename);
        captionData = await d3.json(captionUrl);
        if (captionData != []) {
          console.log("found caption data", movieName, captionUrl);
        }
      } catch {
        console.log(`no captions for ${movieName}`);
      }

      data[movieName] = {
        videoInfo,
        imageSceneData: imageSceneData.sort((a, b) => a.sceneNum - b.sceneNum),
        audioSceneData: audioSceneData.sort((a, b) => a.sceneNum - b.sceneNum),
        captionData: captionData,
        numSamples: videoInfo.samples,
      };

      data[movieName].imageSceneData.forEach((d, i) => {
        allSceneData.push({
          ...d,
          movieName: movieName,
          imgDir: metaData[movieName].imgDir,
          audioDir: metaData[movieName].audioDir,
        });
      });
    } catch {
      console.log("MISSING FILES FOR:", movieName);
      moviesFailed.push(movieName);
    }
  }
  movies = movies.filter((x) => moviesFailed.indexOf(x) === -1);
  return;
}

async function listMovies() {
  // List available movies from local data directory
  // Add movie folder names here as you add more data
  movies = ["test"];
  console.log("MOVIES", movies);
  return movies;
}

window.addEventListener("DOMContentLoaded", async () => {
  console.log("--------------LOAD", data);

  if (data.length == undefined) {
    await loadData();
  }
  console.log("DATA LOADED");
  console.log(data);

  handleRouteChange();
});

window.addEventListener("hashchange", handleRouteChange);
