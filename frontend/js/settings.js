const movieName = "princessSmall";
const movies = ["princessSmall", "Space", "compilation"];

const pathConfig = {
  dataPath: "../data/tmp/",
  audioDataFilename: "audioSceneData.json",
  imageDataFilename: "imageSceneData.json",
  videoDataFilename: "videoInfo.json",
};

let metaData = {};
let data = {};
for (const movieName of movies) {
  mainDir = pathConfig.dataPath + movieName + "/";
  metaData[movieName] = {
    mainDir: mainDir,
    imgDir: mainDir + "images/",
    audioDir: mainDir + "audios/",
    videoDir: mainDir + "videos/",
  };
  data[movieName] = {
    imageSceneData: [],
    audioSceneData: [],
    captionData: [],
    videoInfo: [],
    numSamples: 0,
  };
}

// //data
// let imageSceneData;
// let audioSceneData;
// let captionData;
// let videoInfo;
// let numSamples;
// const mainDir = pathConfig.dataPath + movieName + "/";
// const imgDir = mainDir + "images/";
// const audioDir = mainDir + "audios/";
// const videoDir = mainDir + "videos/";
let allSceneData;

const audioUtils = {
  shortStep: 0.02,
};

const shrinkSize = 50; //size of when one of them shrinks
const selectedImageSize = 200;
const overlap = 0;
const selectedVideoSize = selectedImageSize + overlap * 2;
const hoverImageSize = 100;
const startSceneNum = 4;

// navigation to a clip
function createBackButton(container) {
  const backButton = container
    .append("img")
    .attr("id", "back-btn")
    .attr("src", "./styles/icons/x.svg");
  backButton.on("click", () => {
    window.history.back();
  });
}
