// const url = "http://localhost:5001";
const url = "https://processing-sound-stories-6194-black-glade-983.fly.dev";
let job_id_val;

async function startJob(params) {
  updateProgressUI(0, "Starting...");
  d3.select("#progress-bar-outer").style("height", "10px");
  const resp = await fetch(url + "/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const { job_id } = await resp.json();
  job_id_val = job_id;
  console.log("JOB ID", job_id_val, job_id, crypto.randomUUID());

  // poll to get the status
  const progressHandler = setInterval(async () => {
    try {
      const statusResp = await fetch(url + `/status/${job_id}`);
      const { progress, message } = await statusResp.json();
      //check if the job is cancelled
      if (progress == -100) {
        console.log("job cancel recieved in progress handler");
        clearInterval(progressHandler);
        updateProgressUI(-100, "Job canceled successfully");
        d3.select("#submit-inputs-button").attr("disabled", null);
        d3.select("#cancel-job").attr("class", "hidden");
      }
      //update the progress
      updateProgressUI(progress, message);
      if (progress >= 100) {
        clearInterval(progressHandler);
      }
      if (progress == 100) {
        showOutput(params["name"], params["numSamples"]);
        d3.select("#progress-bar-outer").style("height", "0px");
        d3.select("#submit-inputs-button").attr("disabled", null);
        d3.select("#cancel-job").attr("class", "hidden");
      }
    } catch {
      console.log("ERROR fetching status");
      clearInterval(progressHandler);
      updateProgressUI(0, "error");
      return;
    }
  }, 1000);
}

async function cancelJob(movieName) {
  updateProgressUI(0, "Cancelling job...");
  try {
    const statusResp = await fetch(url + `/cancel/${job_id_val}/${movieName}`);
    d3.select("#submit-inputs-button").attr("disabled", null);
    d3.select("#cancel-job").attr("class", "hidden");
  } catch {
    updateProgressUI(0, "Failed to cancel Job");
  }
}

function updateProgressUI(progress, message) {
  console.log("updating process");
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");
  bar.style.width = progress + "%";
  text.textContent = message + ` (${progress}%)`;
}

async function showOutput(movieName, numSamples) {
  // d3.select("#output-container").selectAll("*")
  console.log("NEW MOVIE", movieName);
  movies.push(movieName);
  // load the data
  setupMetaData();
  await loadData();

  //preview all of the images
  metaData[movieName].imgDir;
  console.log(data[movieName]);
  const imgPrevs = d3
    .select("#output-container")
    .append("div")
    .attr("class", "upload-image-previews");

  for (let i = 0; i < numSamples; i++) {
    console.log("image linek,", metaData[movieName].imgDir + `${i}-001.png`);
    imgPrevs
      .append("img")
      .attr("src", metaData[movieName].imgDir + `${i}-001.png`)
      .on("click", () => {
        window.location.hash = `#films/${movieName}/${i}`;
      });
  }

  //create a link to the output
  d3.select(".film-submenu")
    .append("a")
    .attr("class", "menu-link")
    .attr("href", `#films/${movieName}`)
    .text(movieName);

  d3.select("#output-container")
    .append("button")
    .text("Go to video page")
    .on("click", () => {
      window.location.hash = `#films/${movieName}`;
    });

  d3.select("#submit-inputs-button").attr("disabled", false);
  d3.select("#cancel-job").attr("class", "hidden");
}
