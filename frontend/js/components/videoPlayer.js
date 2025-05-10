function makeSingleVideoPlayer(outer_container, movieName, sceneNum) {
  let currSceneNum = sceneNum;
  const vidPath = metaData[movieName].videoDir + sceneNum + ".mp4";
  //create the vide

  const container = outer_container
    .append("div")
    .attr("class", "video-wrapper");

  const video = container
    .append("video")
    .attr("id", "displayed-video")
    .attr("sceneNum", sceneNum)
    .attr("movieName", movieName)
    .attr("src", vidPath);
  const progress_container = container
    .append("div")
    .attr("class", "progress-container");

  const progressBar = progress_container
    .append("input")
    .attr("type", "range")
    .attr("id", "progress-bar")
    .attr("value", 0)
    .attr("step", 0.1);
  const controls_container = container
    .append("div")
    .attr("class", "controls-container");

  function updateProgressBar() {
    const progress = progressBar.node();
    const percentage = (video.node().currentTime / video.node().duration) * 100;
    progress.style.background = `linear-gradient(to right, ${d3
      .select("#films-page")
      .style("--text-color")} ${percentage}%, ${d3
      .select("#films-page")
      .style("--bgColor")} ${percentage}%)`;
  }

  const playPauseBtn = controls_container
    .append("img")
    .attr("src", "./styles/icons/play.svg")
    .attr("class", "icon")
    .attr("id", "playPauseBtn");

  //   const volumeBtn = controls_container.append("button").attr("id", "volumeBtn");
  const volumeBtn = controls_container
    .append("img")
    .attr("src", "./styles/icons/volume.svg")
    .attr("class", "icon")
    .attr("id", "volumeBtn");

  const volumeBar = controls_container
    .append("input")
    .attr("class", "hidden")
    .attr("type", "range")
    .attr("id", "volume-bar")
    .attr("value", 1)
    .attr("min", 0)
    .attr("max", 1)
    .attr("step", 0.1);

  volumeBtn.on("click", () => {
    volumeBar.attr("class", "visible");
  });

  //pasuing playing
  playPauseBtn.on("click", () => {
    togglePausePlay();
  });
  document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
      togglePausePlay();
    }
  });

  function togglePausePlay() {
    if (video.node().paused) {
      video.node().play();
      playPauseBtn.attr("src", "./styles/icons/pause.svg");
    } else {
      video.node().pause();
      playPauseBtn.attr("src", "./styles/icons/play.svg");
    }
  }

  //progress bar function
  video.on("timeupdate", function () {
    updateProgressBar();
    const progress = progressBar.node();
    if (video.node().duration > 0) {
      progress.value = (video.node().currentTime / video.node().duration) * 100;
      if (video.node().currentTime == video.node().duration) {
        let currSceneNum =
          (video.attr("sceneNum") + 1) % data[movieName].numSamples;
        changeDisplayedVideo(movieName, currSceneNum);
        video.node().currentTime = 0;
        video.node().play();
      }
    }
  });

  //adjusting progress bar
  progressBar.on("input", function () {
    updateProgressBar();
    const progress = progressBar.node();
    video.node().currentTime = (progress.value / 100) * video.node().duration;
  });

  //adjust volume
  volumeBar.on("input", function () {
    const volume = volumeBar.node();
    video.node().volume = volume.value;
  });
}
