const url = "http://localhost:5001";
// let url ="https://processing-sound-stories-6194-black-dew-3479.fly.dev/process";
async function startJob(params) {
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
    if (progress >= 100) clearInterval(progressHandler);
  }, 1000);
}

function updateProgressUI(progress, message) {
  console.log("updating process");
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");
  bar.style.width = progress + "%";
  text.textContent = message + ` (${progress}%)`;
}
