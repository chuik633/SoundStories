// const sketch_functions = [sketch_wobbly_font];
const sketch_functions = [blury_image];
let currentP5Instance = null;
let secondP5Instance = null;
// where you put all the sketch display stuff
function showSketches(movieName, sceneNum) {
  const sketches_container = d3.select("#sketches-container");
  const sketch_h = sketches_container.node().getBoundingClientRect().height;
  const sketch_w = sketches_container.node().getBoundingClientRect().width;
  console.log(document.getElementById("sketches-container"));
  if (!document.getElementById("sketches-container")) {
    return;
  }
  //cleanup
  sketches_container.selectAll("*").remove();
  if (currentP5Instance) {
    console.log("removing current instance");
    currentP5Instance.remove();
    currentP5Instance = null;
  }

  const sketch_container = sketches_container
    .append("div")
    .attr("class", "sketch-container")
    .style("width", `${sketch_w}px`)
    .style("height", `fit-content`);
  currentP5Instance = new p5(
    // (p) => instrumentSketch(p, sketch_container.node(), movieName, sceneNum)
    (p) => dynamicFontSketch(p, sketch_container.node(), movieName, sceneNum)
  );
}

function showInstruments(container, movieName, sceneNum) {
  const sketch_h = container.node().getBoundingClientRect().height;
  const sketch_w = container.node().getBoundingClientRect().width;
  container.selectAll("*").remove();
  if (secondP5Instance) {
    console.log("removing current instance");
    secondP5Instance.remove();
    secondP5Instance = null;
  }

  secondP5Instance = new p5((p) =>
    instrumentSketch(p, container.node(), movieName, sceneNum)
  );
}
