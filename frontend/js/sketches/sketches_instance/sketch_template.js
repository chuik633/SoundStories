/**
 * p; the sketc instance
 * parentDiv; the div to fit the canvas to
 * sceneNum; the int for the scene index for the data
 */

const sketch_template = (p, parentDiv, movieName, sceneNum) => {
  //the video or audio to sync to
  const syncId = "#displayed-video";

  //data variables
  const img_path = `${metaData[movieName].imgDir}${sceneNum}.png`;
  const imgEntry = data[movieName].imageSceneData[sceneNum];
  const audioEntry = data[movieName].audioSceneData[sceneNum];
  const captionSceneEntry = data[movieName].captionData[sceneNum];
  const audio_path = `${metaData[movieName].audioDir}${sceneNum}.png`;

  //audio variables
  let timestamp, shortIdx, captionIdx;
  let mcc_list, chromagram_list, notes;
  let caption;

  //canvas variables
  let width, height;

  //text variables
  let font;
  let maxFontSize = 50;
  let sampleFac = 0.8;

  p.preload = function () {
    font = p.loadFont("styles/fonts/Jost-Bold.ttf");
  };

  // p.setup = function () {
    //instance mode set up DO THIS FOR ALL
    const parentRect = parentDiv.getBoundingClientRect();
    width = parentRect.width;
    height = parentRect.height;

    //bind canvas to parent
    const canvas = p.createCanvas(width, height);
    canvas.parent(parentDiv);

    //skektch se tup stuff
    p.background("black");
    p.textFont(font);
  };

  p.draw = function () {
    syncData();
  };

  function syncData() {
    //get current time stamp
    timestamp = d3.select(syncId).node().currentTime;
    shortIdx = Math.round(timestamp / audioUtils.shortStep);

    //mcc list info
    mcc_list = [];
    for (let coef_num = 1; coef_num < 12; coef_num++) {
      mcc_list.push(audioEntry[`mfcc_${coef_num}`][shortIdx]);
    }

    //chromagram
    chromagram_list = [];
    for (let coef_num = 1; coef_num < 12; coef_num++) {
      chromagram_list.push(audioEntry[`chroma_${coef_num}`][shortIdx]);
    }

    //notes
    notes = audioEntry["notes_at_timestamps"][Math.floor(timestamp)];

    //get the caption
    for (const caption of captionSceneEntry) {
      if (
        timestamp > caption.start_seconds &&
        timestamp < caption.end_seconds
      ) {
        caption = caption.caption;
      }
    }
  }
};
