const movieName = "compilation";

pathConfig = {
  dataPath: "../data/tmp/",
  audioDataFilename: "audioSceneData.json",
  imageDataFilename: "imageSceneData.json",
  videoDataFilename: "videoInfo.json",
};

const mainDir = pathConfig.dataPath + movieName + "/";
const imgDir = mainDir + "images/";
const audioDir = mainDir + "audios/";
const videoDir = mainDir + "videos/";

console.log("mainDir", mainDir);
