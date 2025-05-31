function setupPausePlayAnimation() {
  const pausePlayContainer = document.getElementById("pause-play-container");

  const pausePlayAnimation = lottie.loadAnimation({
    container: pausePlayContainer,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "./styles/animations/pauseplay.json",
  });

  let frameRate = 30;
  let frame_pause_to_play = 0;
  let frame_play_to_pause = 0;
  let totalFrames = 0;
  let currentState = "playing"; //playing or paused

  pausePlayAnimation.addEventListener("DOMLoaded", () => {
    frameRate = pausePlayAnimation.frameRate || 30;
    frame_pause_to_play = frameRate * 1; // 1s = play transition
    frame_play_to_pause = frameRate * 2.37; // 2.11s = pause transition
    totalFrames = pausePlayAnimation.getDuration(true);
    pausePlayAnimation.goToAndStop(frame_pause_to_play, true);
    const btn = document.getElementById("pause-play-container");
    btn.click();
  });

  pausePlayContainer.addEventListener("click", () => {
    if (currentState === "paused") {
      pausePlayAnimation.setSpeed(1);
      pausePlayAnimation.playSegments([0, frame_pause_to_play], true);
      currentState = "playing";
    } else {
      pausePlayAnimation.setSpeed(1);
      pausePlayAnimation.playSegments(
        [frame_pause_to_play, frame_play_to_pause],
        true
      );
      currentState = "paused";
    }
  });
}
