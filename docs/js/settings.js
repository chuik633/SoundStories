let movies = [];

function getUrl(movieName, file) {
  return `./data/${movieName}/${file}`;
}

const pathConfig = {
  audioDataFilename: "audioSceneData.json",
  imageDataFilename: "imageSceneData.json",
  videoDataFilename: "videoInfo.json",
  captionsFilename: "captions.json",
};

let metaData = {};
let data = {};

function setupMetaData() {
  for (const movieName of movies) {
    metaData[movieName] = {
      mainDir: getUrl(movieName, ""),
      imgDir: getUrl(movieName, "images/"),
      audioDir: getUrl(movieName, "audios/"),
      videoDir: getUrl(movieName, "videos/"),
    };
    data[movieName] = {
      imageSceneData: [],
      audioSceneData: [],
      captionData: [],
      videoInfo: [],
      numSamples: 0,
    };
  }
}
setupMetaData();

console.log(metaData);

let allSceneData = [];

const audioUtils = {
  shortStep: 0.02,
};

const shrinkSize = 50;
const selectedImageSize = 200;
const overlap = 0;
const selectedVideoSize = selectedImageSize + overlap * 2;
const hoverImageSize = 100;
const startSceneNum = 4;

function createBackButton(container) {
  const backButton = container
    .append("img")
    .attr("id", "back-btn")
    .attr("class", "icon")
    .attr("src", "./styles/icons/x.svg");
  backButton.on("click", () => {
    window.history.back();
  });
}

const imageSR = 10;
