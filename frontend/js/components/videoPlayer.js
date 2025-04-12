function makeSingleVideoPlayer(
  outer_container,
  sceneNum,
  imgSceneData,
  audioSceneData,
  captionData
) {
  const vidPath = videoDir + sceneNum + ".mp4";
  //create the vide

  const container = outer_container
    .append("div")
    .attr("class", "video-wrapper");

  //place in the background sketch
  const sketch_container = container
    .append("div")
    .attr("class", "video-sketch-container");

  const video = container
    .append("video")
    .attr("id", "displayed-video")
    .attr("sceneNum", sceneNum)
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
    progress.style.background = `linear-gradient(to right, white ${percentage}%, black ${percentage}%)`;
  }

  const playPauseBtn = controls_container
    .append("img")
    .attr("src", "./styles/icons/play.svg")
    .attr("id", "playPauseBtn");

  //   const volumeBtn = controls_container.append("button").attr("id", "volumeBtn");
  const volumeBtn = controls_container
    .append("img")
    .attr("src", "./styles/icons/volume.svg")
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
    if (video.node().paused) {
      video.node().play();
      playPauseBtn.attr("src", "./styles/icons/pause.svg");
    } else {
      video.node().pause();
      playPauseBtn.attr("src", "./styles/icons/play.svg");
    }
  });

  //progress bar function
  video.on("timeupdate", function () {
    updateProgressBar();
    const progress = progressBar.node();
    if (video.node().duration > 0) {
      progress.value = (video.node().currentTime / video.node().duration) * 100;
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

function showVideoColors() {}


