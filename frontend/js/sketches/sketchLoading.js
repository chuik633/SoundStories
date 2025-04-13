const sketch_functions = [sketch_blur_font];
//where you put all the sketch display stuff
function showSketches(sceneNum) {
  const sketch_container = d3.select("#video-sketch-container");
  console.log(document.getElementById("video-sketch-container"));
  if (!document.getElementById("video-sketch-container")){
    return
  }
    sketch_container.selectAll("*").remove();
  for (const sketch_fn of sketch_functions){
    new p5((p) =>
      sketch_fn(
        p,
        sketch_container.node(),
        sceneNum
      )
    );

  }
    
}
