
const width = window.innerWidth;
const height = window.innerHeight;
const padding = 50
let img_width;

async function loadData() {
  let imageSceneData = await d3.json(mainDir + "imageSceneData.json");
  const audioSceneData = await d3.json(mainDir + "audioSceneData.json");
  console.log(imageSceneData);
  console.log(audioSceneData);

  const container = d3
    .select("body")
    .append("div")
    .attr("class", "preview-container");

  makeLayout(container, imageSceneData);
  new p5((p) => sketch_loadingGrain(p, container.node()));
}

function makeLayout(container, imageSceneData) {
  const times = imageSceneData.map((d) => d.sceneNum);
  console.log(d3.extent(times));
  const timeScale = d3.scaleLinear().domain(d3.extent(times)).range([padding, width-padding]);
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", "30px")
    .attr("fill", "white")
    .text("SOUND STORIES");
  img_width = Math.max(Math.min(100,(width / imageSceneData.length)),30) ;

  let nodes = imageSceneData.map((d, i) => {
      let z = Math.floor(Math.random() * 3) + 1;
      let node_w = img_width/2 +z*30;
      return {
        id: i,
        origional_x: timeScale(d.sceneNum),
        origional_y: height / 2,
        x: timeScale(d.sceneNum),
        y: height / 2,
        z: z,
        w: node_w,
        h:node_w*2/3,
        audioPath :audioDir+d.sceneNum+".wav",
        ...d,
        parallaxSpeed: z * 0.5 + 0.5,
      };
  });
  nodes = [...nodes].sort((a, b) => a.z - b.z);
  console.log(nodes.map((d)=>d.z));

  let currentAudio;

  const node = svg
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", (d) => "node-scene-" + d.sceneNum)
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
  node
    .append("rect")
    .attr("class", (d) => "color-node scene-" + d.sceneNum)
    .attr("width", (d) => d.w / 2)
    .attr("height", 1)
    .attr("fill", (d) => {
      let [r, g, b] = d.colors[0];
      return `rgb(${r},${g},${b})`;
    });
  node
      .append("image")
      .attr("class", (d) => "image-node scene-" + d.sceneNum)
      .attr("xlink:href", (d) => imgDir + d["filename"])
      .attr("width", (d) => d.w / 2)
      .attr("height", (d) => d.h / 2)
      .on("mouseover", (event, d) => {
        const audioEl = d3.select('.audio-node.scene-'+d.sceneNum).node();
        currentAudio = audioEl;
        currentAudio.play();
        growSize(d.sceneNum)
      })
      .on("mouseleave", (event, d) => {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        shrinkSize(d.sceneNum)});
  container
    .append("div")
    .attr("class", "audio-container")
    .selectAll("audio")
    .data(nodes)
    .enter()
    .append("audio")
    .attr("class", (d) => "audio-node scene-" + d.sceneNum)
    .attr("src", (d) => d.audioPath)
    .attr("preload", "auto");
  makeSim(nodes, node);



  const growFac = 10
  function growSize(sceneNum) {
    d3.select(".image-node.scene-" + sceneNum)
      .interrupt()
      .transition()
      .duration(100)
      .ease(d3.easeLinear)
      .attr("height", (d) => d.h + growFac)
      .attr("width", (d) => d.w + growFac);
    d3.select(".color-node.scene-" + sceneNum)
      .interrupt()
      .transition()
      .duration(100)
      .ease(d3.easeLinear)
      .attr("height", (d) => d.h)
      .attr("width", (d) => d.w + growFac);
  }

  function shrinkSize(sceneNum){
    d3.select(".image-node.scene-" + sceneNum)
      .transition()
      .duration(100)
      .ease(d3.easeLinear)
      .attr("height", (d) => d.h - growFac)
      .attr("width", (d) => d.w - growFac);
     d3.select(".color-node.scene-" + sceneNum)
       .transition()
       .duration(100)
       .ease(d3.easeLinear)
       .attr("height", 1)
       .attr("width",d=> d.w - growFac);
  }
  
  
  let scrollPos = 0;
  const scrollSpeed = .1;  // Overall speed of scrolling
  const maxScroll = svg.node().getBBox().width;

  function updateScroll() {
    scrollPos += scrollSpeed;

    nodes.forEach((d) => {
      const parallaxOffset = d.parallaxSpeed * scrollPos;
      d.x = d.origional_x - parallaxOffset;
      if(d.x > width){
        d.x= 0
      }

      d3.select(".image-node.scene-" + d.sceneNum)
        .attr("x", d.x);
      d3.select(".color-node.scene-" + d.sceneNum)
        .attr("x", d.x);
    });
    // svg.attr("transform", `translate(${-scrollPos}, 0)`);
    if (scrollPos > maxScroll) {
      scrollPos = 0;
    }
    requestAnimationFrame(updateScroll);
  }
  updateScroll()
}


function makeSim(nodes, node) {
  let sim = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-0.01))
    .alpha(1)
    .alphaDecay(0.1)
    .force(
      "collision",
      d3
        .forceCollide()
        .radius((d) => d.w + 20)
        .strength(1)
    )
    .force("y", d3.forceY().strength(1.5).y(height / 2))
    .on("tick", () => ticked())
    .on("end", () => {
      console.log("ending");
      sim.stop();
      // animateScroll(node, color_node, nodes);
    });
  


  function ticked() {
      node.attr(
        "transform",
        (d) =>{
          let updatedX = Math.max(0, Math.min(width - 0 - d.w, d.x));
          let updatedY = d.y;
          if (updatedY <= 0 || updatedY >= height - d.h) {
            d.vy = -d.vy*.5;
          }
          d.y += d.vy; 
          updatedY = Math.max(0, Math.min(height - d.h, d.y));  

          return `translate(${updatedX},  ${updatedY})`;
        }
      );

  }


  return sim;
}

function animateScroll(node, color_node,nodes){
  const scrollDuration = 50000;
  const easeFN = d3.easeLinear;
  function scrollNodes(n){
    n.transition()
      .duration(scrollDuration)
      .ease(easeFN)

      .attr("x", (d) => {
        return d.x + width;
      })
      .on("end", function () {
        console.log("end of image")
        const d = d3.select(this).data()[0];
        d.x = 0;
        d3.select(this).attr("x", d.x).on("end", scrollNodes);
      });
  }
  scrollNodes(node);
  scrollNodes(color_node);

}
loadData();
