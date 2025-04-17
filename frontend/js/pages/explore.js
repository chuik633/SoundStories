const width = window.innerWidth;
const height = window.innerHeight;
const padding = 50;
let img_width;

function initExplorePage() {
  const container = d3
    .select("#explore-page")
    .append("div")
    .attr("class", "explore-container");

  let loaded = document.getElementById("explore-page");

  //floating previews
  if (loaded) {
    makeLayout(container);
    console.log("made layout");
  } else {
    console.log("not loaded");
  }
  //sketch overlay
  new p5((p) => sketch_loadingGrain(p, container.node()));
}

function makeLayout(container) {
  const times = allSceneData.map((d) => d.sceneNum);
  const timeScale = d3
    .scaleLinear()
    .domain(d3.extent(times))
    .range([padding, width - padding]);
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  console.log("SVG", svg);
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height / 2 + 50)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", "10px")
    .attr("fill", "white")
    .text("MUSIC IN FILM");
  img_width = Math.max(Math.min(120, width / allSceneData.length), 80);

  let nodes = allSceneData.map((d, i) => {
    let z = Math.floor(Math.random() * 3) + 1;
    let node_w = img_width / 2 + z * 10;
    return {
      id: i,
      origional_x: timeScale(d.sceneNum),
      origional_y: height / 2,
      x: timeScale(d.sceneNum),
      y: height / 2,
      z: z,
      w: node_w,
      h: (node_w * 2) / 3,
      audioPath: d.audioDir + d.sceneNum + ".wav",
      ...d,
      parallaxSpeed: z * 1.2 + 0.2,
    };
  });
  nodes = [...nodes].sort((a, b) => a.z - b.z);

  let currentAudio;

  const node = svg
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", (d) => "node-id-" + d.id)
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
  node
    .append("rect")
    .attr("class", (d) => "color-node id-" + d.id)
    .attr("width", (d) => d.w / 2)
    .attr("height", 1)
    .attr("fill", (d) => {
      let [r, g, b] = d.colors[0];
      return `rgb(${r},${g},${b})`;
    });
  node
    .append("image")
    .attr("class", (d) => "image-node id-" + d.id)
    .attr("xlink:href", (d) => d.imgDir + d["filename"])
    .attr("width", (d) => d.w / 2)
    .attr("height", (d) => d.h / 2)
    .on("mouseover", (event, d) => {
      const audioEl = d3.select(".audio-node.id-" + d.id).node();
      currentAudio = audioEl;
      currentAudio.play();
      growSize(d.sceneNum);
    })
    .on("mouseleave", (event, d) => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      shrinkSize(d.sceneNum);
    })
    .on("click", (event, d) => {
      console.log("click");
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    });

  container
    .append("div")
    .attr("class", "audio-container")
    .selectAll("audio")
    .data(nodes)
    .enter()
    .append("audio")
    .attr("class", (d) => "audio-node id-" + d.id)
    .attr("src", (d) => d.audioPath)
    .attr("preload", "auto")
    .each(function () {
      this.load(); // Explicitly tell browser to load now
    });

  makeSim(nodes, node);

  const growFac = 20;
  const dur = 2000;
  function growSize(id) {
    d3.select(".image-node.id-" + id)
      .interrupt()
      .transition()
      .duration(dur)
      .ease(d3.easeLinear)
      .attr("height", (d) => d.h + growFac)
      .attr("width", (d) => d.w + growFac);
    d3.select(".color-node.id-" + id)
      .interrupt()
      .transition()
      .duration(dur)
      .ease(d3.easeLinear)
      .attr("height", (d) => d.h)
      .attr("width", (d) => d.w + growFac);
  }

  function shrinkSize(id) {
    d3.select(".image-node.id-" + id)
      .transition()
      .duration(dur / 4)
      .ease(d3.easeLinear)
      .attr("height", (d) => d.h - growFac)
      .attr("width", (d) => d.w - growFac);
    d3.select(".color-node.id-" + id)
      .transition()
      .duration(dur / 4)
      .ease(d3.easeLinear)
      .attr("height", 1)
      .attr("width", (d) => d.w - growFac);
  }

  let scrollPos = 0;
  const scrollSpeed = 0.1;

  const maxScroll = width;
  function updateScroll() {
    scrollPos += scrollSpeed;

    nodes.forEach((d) => {
      const parallaxOffset = d.parallaxSpeed * scrollPos;
      d.x = d.origional_x - parallaxOffset;
      if (d.x > width) {
        d.x = 0;
      }

      d3.select(".image-node.id-" + d.id).attr("x", d.x);
      d3.select(".color-node.id-" + d.id).attr("x", d.x);
    });
    // svg.attr("transform", `translate(${-scrollPos}, 0)`);
    if (scrollPos > maxScroll) {
      scrollPos = 0;
    }
    requestAnimationFrame(updateScroll);
  }
  updateScroll();
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
    .force(
      "y",
      d3
        .forceY()
        .strength(1.5)
        .y(height / 2)
    )
    .on("tick", () => ticked())
    .on("end", () => {
      console.log("ending");
      sim.stop();
      // animateScroll(node, color_node, nodes);
    });

  function ticked() {
    node.attr("transform", (d) => {
      let updatedX = Math.max(0, Math.min(width - 0 - d.w, d.x));
      let updatedY = d.y;
      if (updatedY <= 0 || updatedY >= height - d.h) {
        d.vy = -d.vy * 0.5;
      }
      d.y += d.vy;
      updatedY = Math.max(0, Math.min(height - d.h, d.y));

      return `translate(${updatedX},  ${updatedY})`;
    });
  }

  return sim;
}

function animateScroll(node, color_node, nodes) {
  const scrollDuration = 50000;
  const easeFN = d3.easeLinear;
  function scrollNodes(n) {
    n.transition()
      .duration(scrollDuration)
      .ease(easeFN)

      .attr("x", (d) => {
        return d.x + width;
      })
      .on("end", function () {
        console.log("end of image");
        const d = d3.select(this).data()[0];
        d.x = 0;
        d3.select(this).attr("x", d.x).on("end", scrollNodes);
      });
  }
  scrollNodes(node);
  scrollNodes(color_node);
}
