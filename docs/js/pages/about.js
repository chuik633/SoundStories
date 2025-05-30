function initAboutPage() {
  console.log("INTI ABOUT PAGE");
  console.log(document.querySelectorAll(".writeup h2").length);
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
      debug: true,
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

  // 5) Make sure to recalc on resize
  window.addEventListener("resize", scroller.resize);
}
