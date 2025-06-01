async function loadData() {
  // const movies = await listMovies();

  for (const movieName of movies) {
    // create urls using supabase
    console.log("loading data");
    const videoUrl = await getUrl(movieName, pathConfig.videoDataFilename);
    const videoInfo = await d3.json(videoUrl);

    const imgUrl = await getUrl(movieName, pathConfig.imageDataFilename);
    const imageSceneData = await d3.json(imgUrl);

    const audioUrl = await getUrl(movieName, pathConfig.audioDataFilename);
    const audioSceneData = await d3.json(audioUrl);

    // console.log("video info", videoInfo);
    // console.log(imageSceneData);
    // console.log(audioSceneData);
    // console.log("loaded data");

    // captions.json not alwayts there
    let captionData = [];
    try {
      const captionUrl = await getUrl(movieName, pathConfig.captionsFilename);
      captionData = await d3.json(captionUrl);
    } catch {
      console.log(`no captions for ${movieName}`);
    }

    data[movieName] = {
      videoInfo,
      imageSceneData: imageSceneData.sort((a, b) => a.sceneNum - b.sceneNum),
      audioSceneData: audioSceneData.sort((a, b) => a.sceneNum - b.sceneNum),
      captionData,
      numSamples: +videoInfo.samples,
    };

    // flatten into allSceneData
    data[movieName].imageSceneData.forEach((d, i) => {
      allSceneData.push({
        ...d,
        movieName: movieName,
        imgDir: metaData[movieName].imgDir,
        audioDir: metaData[movieName].audioDir,
      });
    });
  }
  // console.log("ALL SCENE DATA");
  // console.log(allSceneData);
  return;
}

async function listMovies() {
  const { data: objects, error } = await supabaseClient.storage
    .from("data")
    .list("", { limit: 1000 });

  if (error) {
    console.log("ERROR", error);
    throw error;
  }
  console.log("OBJECTS", objects);

  const movies = Array.from(new Set(objects.map((o) => o.name.split("/")[0])));
  console.log("MOVIES", movies);
  return movies;
}

window.addEventListener("DOMContentLoaded", async () => {
  // only loads once
  console.log("--------------LAOD", data);

  if (data.length == undefined) {
    await loadData();
  }
  console.log("DATA LOADED");
  console.log(data);

  handleRouteChange();
});

window.addEventListener("hashchange", handleRouteChange);
