const movieName = "princessSmall";

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

console.log("mainDir", mainDir);
