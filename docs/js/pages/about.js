function initAboutPage() {
  console.log("INTI ABOUT PAGE");
  console.log(document.querySelectorAll(".writeup h2").length);
  const parentCont = document.getElementById("howcontainer");
  new p5((p) => howitworks(p, parentCont));
  setupPausePlayAnimation();
  const scroller = scrollama();
  const page = document.querySelector("#about-page");
  console.log(
    "scrollHeight:",
    page.scrollHeight,
    "clientHeight:",
    page.clientHeight
  );
  document.querySelectorAll(".writeup .step").forEach((h2, i) => {
    if (i > 1) {
      h2.setAttribute("data-offset", "-50px");
    }
  });

  scroller
    .setup({
      step: "#about-page .step", // each heading is a “step”
      offset: "100px",
    })
    .onStepEnter(({ element, index }) => {
      console.log("STEP", index);

      document
        .querySelectorAll(".writeup h2")
        .forEach((h2) => h2.classList.remove("is-active"));
      element.classList.add("is-active");

      if (index > 1) {
        d3.select("#about-page .writeup h2.is-active").attr(
          "class",
          "h2 is-active a2"
        );
        d3.select("#about-page .row").attr("class", "row scroll1");
      } else {
        d3.select("#about-page .writeup h2.is-active").attr(
          "class",
          "h2 is-active"
        );
        d3.select("#about-page .row").attr("class", "row");
      }
    })
    .onStepExit((response) => {
      // if you scroll back up past a heading, remove its active
      if (response.direction === "up") {
        response.element.classList.remove("is-active");
      }
    });
  initLetterAnimation();
  window.addEventListener("resize", scroller.resize);
}

function initLetterAnimation() {
  const scrollerLetter = scrollama();
  const letterAnimation = lottie.loadAnimation({
    container: document.getElementById("letter-lottie"),
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "./styles/animations/letterAnimation.json",
  });
  console.log("INIT LETTER ANIMATION");
  console.log(letterAnimation);
  let totalFramesLetter = 0;
  letterAnimation.addEventListener("data_ready", () => {
    console.log("animation ready");
    totalFramesLetter = letterAnimation.getDuration(true);
    const frameRate = letterAnimation.frameRate || 30;
    const durationInSeconds = totalFramesLetter / frameRate;
    console.log(durationInSeconds);

    const pixelsPerSecond = 100;
    const stepHeight = durationInSeconds * pixelsPerSecond;
    document.querySelector(
      "#letter-section .scrolly .stepl"
    ).style.height = `${stepHeight}px`;

    scrollerLetter
      .setup({
        step: "#letter-section .stepl",
        offset: 0.5,
        progress: true,
      })
      .onStepProgress((response) => {
        const frame = response.progress * totalFramesLetter;
        letterAnimation.goToAndStop(frame, true);

        // control annotation
        const captionEl = document.getElementById("letter-caption");
        const cappedProgress = Math.min(response.progress / 0.1, 1);
        const xShift = (1 - cappedProgress) * -100;
        const opacity = cappedProgress;

        captionEl.style.transform = `translateX(${-50 + xShift}%)`;
        captionEl.style.opacity = opacity;
      });
  });
}
