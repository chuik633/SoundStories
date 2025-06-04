function initExperimentPage() {
  const container = d3
    .select("#experiment-page")
    .append("div")
    .attr("class", "experiment-container");

  d3.select("#input-youtubeLink").on("change", () => {
    console.log("CHANGE");
    let link = d3.select("#input-youtubeLink").property("value").trim();
    youtubePreview(link);
  });
  let output_container = d3.select("#output-container");
  output_container.selectAll("*").remove();
  output_container
    .append("div")
    .attr("id", "progress-bar-outer")
    .append("div")
    .attr("id", "progress-bar");
  output_container.append("div").attr("id", "progress-text");

  setupDrag();
  d3.select("#submit-inputs-button").on("click", () => formManagement());
}
function youtubePreview(link) {
  console.log("link", link);
  d3.select(".youtube-errors").text("");
  const preview = d3.select("#youtube-preview").attr("class", "hidden");
  const m = link.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/
  );
  if (!m) {
    d3.select(".youtube-errors").text("Not a valid YouTube URL");
    console.warn("Not a valid YouTube URL");
    return;
  }
  const videoId = m[1];
  const testImg = new Image();
  testImg.onload = () => {
    preview.attr(
      "src",
      `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`
    );
  };
  testImg.onerror = () => {
    console.log("ERROR");
    d3.select(".youtube-errors").text(
      "Video not found (thumbnail didn’t load). Won’t update preview."
    );
    return;
  };
  // this URL returns a 120×90 jpg for valid IDs

  const embedUrl =
    `https://www.youtube.com/embed/${videoId}` + `?autoplay=0&controls=1&rel=0`;
  d3.select("#youtube-preview").attr("src", embedUrl).attr("class", "visible");
  console.log(embedUrl);
  testImg.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
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
  const rawName = checkInput("name");
  const name = rawName.replace(/\s+/g, "_").toUpperCase();
  const numSamples = checkInput("numSamples");

  if (youtubeLink != false && name != false && numSamples != false) {
    console.log("toggling buttons");
    // disable the submit job
    d3.select("#submit-inputs-button").attr("disabled", true);
    d3.selectAll(".output-item").attr("class", "output-item");
    //display the cancel job
    d3.select("#cancel-job")
      .attr("class", "visible")
      .on("click", () => {
        cancelJob(name);
      });

    startJob({
      name: name,
      numSamples: numSamples,
      youtubeLink: youtubeLink,
      captions: false,
    });
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
