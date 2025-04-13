const sketch_functions = [];

//where you put all the sketch display stuff
function showSketches(sceneNum) {
  const sketches_container = d3.select("#sketches-container");
  console.log(document.getElementById("sketches-container"));
  if (!document.getElementById("sketches-container")) {
    return;
  }
  sketches_container.selectAll("*").remove();
  for (const sketch_fn of sketch_functions){
    const sketch_container = sketches_container.append('div').attr('class', 'sketch-container')
    new p5((p) =>
      sketch_fn(
        p,
        sketch_container.node(),
        sceneNum
      )
    );

  }
    
}
