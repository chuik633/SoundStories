// const url = "http://localhost:5001";
const url =
  "https://processing-sound-stories-6194-white-waterfall-4148.fly.dev";

// let url ="https://processing-sound-stories-6194-black-dew-3479.fly.dev/process";
async function startJob(params) {
  updateProgressUI(0, "Starting...");
  const resp = await fetch(url + "/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const { job_id } = await resp.json();

  // poll to get the status
  const progressHandler = setInterval(async () => {
    const statusResp = await fetch(url + `/status/${job_id}`);
    const { progress, message } = await statusResp.json();
    updateProgressUI(progress, message);
    if (progress >= 100) {
      clearInterval(progressHandler);
    }
    if (progress == 100) {
      showOutput(params["name"]);
    }
  }, 1000);
}

function updateProgressUI(progress, message) {
  console.log("updating process");
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");
  bar.style.width = progress + "%";
  text.textContent = message + ` (${progress}%)`;
}

function showOutput(movieName) {
  // d3.select("#output-container").selectAll("*")
  console.log("NEW MOVIE", movieName);
  movies.push(movieName);
  // load the data
  setupMetaData();
  loadData();
  console.log(allSceneData);

  //preview all of the images
  metaData[movieName].imgDir;
  const numSamples = data[movieName].videoInfo.samples;
  const imgPrevs = d3
    .select("#output-container")
    .append("div")
    .attr("class", "upload-image-previews");

  for (let i = 0; i < numSamples; i++) {
    imgPrevs
      .append("img")
      .attr("src", metaData[movieName].imgDir + `${i}-001.png`);
  }

  //create a link to the output
  d3.select(".film-submenu")
    .append("a")
    .attr("class", "menu-link")
    .attr("href", `#films/${movieName}`)
    .text(movieName);

  d3.select("#output-container")
    .append("a")
    .attr("href", `#films/${movieName}`)
    .text("Go to video page");
}
