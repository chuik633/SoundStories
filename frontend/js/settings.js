const movieName = "compilation";

const pathConfig = {
  dataPath: "../data/tmp/",
  audioDataFilename: "audioSceneData.json",
  imageDataFilename: "imageSceneData.json",
  videoDataFilename: "videoInfo.json",
};

const mainDir = pathConfig.dataPath + movieName + "/";
const imgDir = mainDir + "images/";
const audioDir = mainDir + "audios/";
const videoDir = mainDir + "videos/";

const audioUtils = {
  shortStep: 0.02,
};


const shrinkSize = 50; //size of when one of them shrinks
const selectedImageSize = 200;
const overlap = 0;
const selectedVideoSize = selectedImageSize + overlap * 2;
const hoverImageSize = 100;
const startSceneNum = 4;

//data
let imageSceneData;
let audioSceneData;
let captionData;
let videoInfo;
let numSamples;