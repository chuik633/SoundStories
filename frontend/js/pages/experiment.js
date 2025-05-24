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
  d3.select("#submit-inputs-button").on("click", () => formManagement());
}

function formManagement() {
  const form = d3.select("#experiment-page .left-panel");
  function checkInput(inputName) {
    const input = form.select(`#input-${inputName}`);
    const inputVal = input.property("value");
    if (inputVal === undefined || inputVal.length == 0) {
      input.property("value", "");
      input.property("placeholder", "! required");
      input.attr("class", "invalid");
      return false;
    } else {
      return inputVal;
    }
  }
  const youtubeLink = checkInput("youtubeLink");
  const name = checkInput("name");
  const numSamples = checkInput("numSamples");
  if (youtubeLink != false && name != false && numSamples != false) {
    //all true
    console.log(
      JSON.stringify({
        name: name,
        numSamples: numSamples,
        youtubeLink: youtubeLink,
        captions: false,
      })
    );
    fetch("http://172.20.10.10:4000/getData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        numSamples: numSamples,
        youtubeLink: youtubeLink,
        captions: false,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  } else {
    return;
  }
}

//dragging
function setupDrag() {
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
