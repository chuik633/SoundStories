// const sketch_functions = [sketch_wobbly_font];
const sketch_functions = [blury_image];
let currentP5Instance = null;
//where you put all the sketch display stuff
// function showSketches(movieName, sceneNum) {
//   const sketches_container = d3.select("#sketches-container");
//   const sketch_h = sketches_container.node().getBoundingClientRect().height;
//   const sketch_w = sketches_container.node().getBoundingClientRect().width;
//   console.log(document.getElementById("sketches-container"));
//   if (!document.getElementById("sketches-container")) {
//     return;
//   }
//   //cleanup
//   sketches_container.selectAll("*").remove();
//   if (currentP5Instance) {
//     console.log("removing current instance");
//     currentP5Instance.remove();
//     currentP5Instance = null;
//   }

//   const sketch_container = sketches_container
//     .append("div")
//     .attr("class", "sketch-container")
//     .style("width", `${700}px`)
//     .style("height", `${500}px`);
//   currentP5Instance = new p5((p) =>
//     dynamicFontSketch(p, sketch_container.node(), movieName, sceneNum)
//   );
// }

function showSketches(movieName, sceneNum) {
  const sketches_container = d3.select("#sketches-container");
  const sketch_h = sketches_container.node().getBoundingClientRect().height;
  const sketch_w = sketches_container.node().getBoundingClientRect().width;
  console.log(document.getElementById("sketches-container"));
  if (!document.getElementById("sketches-container")) {
    return;
  }
  sketches_container.selectAll("*").remove();

  for (const sketch_fn of sketch_functions) {
    const sketch_container = sketches_container
      .append("div")
      .attr("class", "sketch-container")
      .style("width", `${700}px`)
      .style("height", `${500}px`);

    new p5((p) => sketch_fn(p, sketch_container.node(), movieName, sceneNum));
  }
}
