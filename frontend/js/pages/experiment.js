
function initExperimentPage() {
  const container = d3
    .select("#experiment-page")
    .append("div")
    .attr("class", "experiment-container");

  let loaded = document.getElementById("experiment-page");

  //floating previews
  if (loaded) {
    console.log("made layout");
  } else {
    console.log("not loaded");
  }

  setupDrag();

}


//dragging
function setupDrag(){
    const dragPanel = document.getElementById("drag-panel");
    const leftPanel = document.querySelector(".left-panel");

    let isDragging = false;

    dragPanel.addEventListener("mousedown", (e) => {
      isDragging = true;
      // document.body.style.cursor = 'ew-resize';
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      console.log("draggin");
      const newWidth = e.clientX;
      if (newWidth > 150 && newWidth < window.innerWidth - 150) {
        leftPanel.style.width = newWidth + "px";
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.cursor = "default";
    });

}
