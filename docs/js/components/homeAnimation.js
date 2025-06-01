function setupHomeAnimation() {
  const homeContainer = document.getElementById("home-button");

  const homeAnimation = lottie.loadAnimation({
    container: homeContainer,
    loop: false,
    autoplay: false,
    path: "./styles/animations/home.json",
    audio: false,
  });

  const audio = new Audio("./styles/animations/home-audio.mp3");
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";

  let frameRate = 30;
  let totalFrames = 0;
  let endFrame = 0;
  let startFrame = 0;
  let doorFrame = 0;
  let isAnimating = false;

  homeAnimation.addEventListener("DOMLoaded", () => {
    frameRate = homeAnimation.frameRate || 30;
    totalFrames = homeAnimation.getDuration(true);
    endFrame = totalFrames;
    doorFrame = Math.floor(totalFrames * 0.5);
    homeAnimation.goToAndStop(startFrame, true);
  });

  homeContainer.addEventListener("mouseover", () => {
    if (isAnimating) return;
    homeAnimation.goToAndStop(doorFrame, true);
  });

  homeContainer.addEventListener("mouseleave", () => {
    if (isAnimating) return;
    homeAnimation.goToAndStop(endFrame, true);
    // const current = Math.round(homeAnimation.currentFrame);
    // if (current === doorFrame) {
    //   isAnimating = true;
    //   homeAnimation.playSegments([doorFrame, endFrame], true);
    //   audio.currentTime = 0;
    //   audio.play().catch((err) => console.warn("Audio play() failed:", err));
    // }
  });

  homeAnimation.addEventListener("complete", () => {
    audio.pause();
    isAnimating = false;
  });

  d3.select("#menu-btn").on("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    homeAnimation.playSegments([startFrame, endFrame], true);
    audio.currentTime = 0;
    audio.play().catch((err) => console.warn("Audio play() failed:", err));
    setTimeout(() => {
      audio.pause();
    }, 2000);
  });

  window.addEventListener("resize", () => {
    if (homeAnimation && homeAnimation.isLoaded) {
      console.log("Resizing animation...");
      homeAnimation.resize();
    } else {
      console.warn("Animation not loaded, skipping resize.");
    }
  });
}
