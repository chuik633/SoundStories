const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

//helper funciton to execute shell compands /handles the errors
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      //this is mainly error handling
      if (error) {
        reject(`! ERROR: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

//making all the directories
function makeFolders(tmpDir, name) {
  //save all paths
  let paths = {};

  //make the video folder if it doesnt exist
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  //add the inside folders
  const folders = ["images", "audios", "videos"];
  for (const folder of folders) {
    const folderPath = path.join(tmpDir, folder);
    paths[folder] = folderPath;
    if (!fs.existsSync(folderPath)) {
      //make it if it doesnt exist
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  return paths;
}

//get video duration
async function getVideoLength(videoFilePath) {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v quiet -print_format json -show_format ${videoFilePath}`
    );

    const videoInfo = JSON.parse(stdout);
    const duration = videoInfo.format.duration;

    return parseFloat(duration);
  } catch (error) {
    console.error("Error retrieving video duration:", error);
  }
}

//VIDEO PROCESS:
async function processVideo(videoFilePath, name, numSamples) {
  //1. MAKE THE FOLDERS + GET THE PATHS
  const tmpDir = path.join(__dirname, "tmp", name);

  const { images, audios, videos } = makeFolders(tmpDir, name);

  try {
    console.log("0. Computing video sample rate: ", name);
    const videoLength = await getVideoLength(videoFilePath);
    const intervalLen = videoLength / numSamples;

    //write the variables to a file
    const videoInfo = {
      length: videoLength,
      sampleLength: intervalLen,
      samples: numSamples,
    };

    fs.writeFile(
      path.join(tmpDir, "videoInfo.json"),
      JSON.stringify(videoInfo, null, 2), // null, 2 adds indentation for pretty-printing
      (err) => {
        if (err) {
          console.error("err:", err);
        } else {
          console.log("videoInfo.json written");
        }
      }
    );
    console.log("wrote the settings");

    for (let sampleNum = 0; sampleNum < numSamples; sampleNum++) {
      const startTime = sampleNum * intervalLen;
      const endTime = Math.min((sampleNum + 1) * intervalLen, videoLength);

      //destination paths
      const videoSegmentPath = path.join(videos, `${sampleNum}.mp4`);
      const audioSegmentPath = path.join(audios, `${sampleNum}.wav`);
      const imgSegmentPath = path.join(images, `${sampleNum}.png`);

      //split up the video
      await executeCommand(
        `ffmpeg -i "${videoFilePath}" -ss ${startTime} -to ${endTime} -c copy "${videoSegmentPath}"`
      );

      //extract the audio
      await executeCommand(
        `ffmpeg -i "${videoSegmentPath}" -q:a 0 -map a "${audioSegmentPath}"`
      );

      //extract the image
      await executeCommand(
        `ffmpeg -i "${videoSegmentPath}" -ss 00:00:00 -vframes 1 ${imgSegmentPath}`
      );
    }
  } catch (error) {
    console.error("!ERROR PROCESSING VIDEO:", error);
  }
}

const name = process.argv[2];
const numSamples = process.argv[3];
if (!name) {
  console.error("Error: un please give a name thanks");
  process.exit(1);
}
if (!numSamples) {
  console.error("NEED SMPLE NUM");
  process.exit(1);
}

const videoPath = `./tmp/${name}/video.mp4`;
processVideo(videoPath, name, numSamples)
  .then((result) => {
    console.log("Media processed successfully:", result);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
