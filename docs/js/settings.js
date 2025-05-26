const movies = ["Ponyo"];
const SUPABASE_URL = "https://didoznoxnkzkuqdswwfn.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZG96bm94bmt6a3VxZHN3d2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDgwMDYsImV4cCI6MjA2MzY4NDAwNn0.NNEfP_Wa0CpgxXL8FNB_QxqKyj3s-jjbxMOxPy6KDvU";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
function getUrl(movieName, file) {
  const {
    data: { publicUrl },
    error: urlErr,
  } = supabaseClient.storage.from("data").getPublicUrl(`${movieName}/${file}`);

  if (urlErr) {
    console.error("Error getting public URL:", urlErr);
    return;
  } else {
    return publicUrl;
  }
}
const pathConfig = {
  audioDataFilename: "audioSceneData.json",
  imageDataFilename: "imageSceneData.json",
  videoDataFilename: "videoInfo.json",
};

let metaData = {};
let data = {};

for (const movieName of movies) {
  mainDir = getUrl(movieName, "");
  metaData[movieName] = {
    mainDir: mainDir,
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
console.log(metaData);

let allSceneData = [];

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
    .attr("class", "icon")
    .attr("src", "./styles/icons/x.svg");
  backButton.on("click", () => {
    window.history.back();
  });
}
