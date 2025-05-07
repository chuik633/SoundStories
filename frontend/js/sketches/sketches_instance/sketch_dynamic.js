const dynamicFontSketch = (p, parentDiv, movieName, sceneNum) => {
  const syncId = "#displayed-video";
  let font;
  let audioSceneEntry;
  let imageSceneEntry;
  let timestamp = 0;
  let audioIdx;
  let mfcc_ranges = {};

  //dynamic font stuff
  const dynamicFontOptions = ["wiggly", "strings", "flow", "blur", "swirl"];
  const dynamicFontType = "strings";
  let width = window.innerWidth;
  let height = (window.innerHeight * 2) / 3 - 100;
  const textX = width / 2;
  const textY = height / 2;
  const textWidth = width - 80;
  const textContent = movieName;
  let textColor = "black";
  let bgColor;
  let sound = d3.select(syncId).node();

  //audio info
  const pitches = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  p.preload = () => {
    // font = p.loadFont("styles/fonts/futura/FuturaCyrillicBold.ttf");
    font = p.loadFont("styles/fonts/Jost-Bold.ttf");
    audioSceneEntry = p.loadJSON(
      metaData[movieName]["mainDir"] + pathConfig.audioDataFilename
    );
    imageSceneEntry = p.loadJSON(
      metaData[movieName].mainDir + pathConfig.imageDataFilename
    );
  };

  p.setup = () => {
    bgColor = "#EFEDE3";
    audioSceneEntry = audioSceneEntry[sceneNum];
    console.log("setting up new sketch");
    console.log(audioSceneEntry);

    const canvas = p.createCanvas(width, height);
    canvas.parent(parentDiv);
    p.background(bgColor);
    p.textFont(font);
    sound = setupDynamicFont(
      p,
      dynamicFontType,
      [],
      textContent,
      font,
      textX,
      textY,
      textWidth
    );
    setupFeatureRanges();
  };

  p.draw = () => {
    p.background(bgColor);

    p.fill(textColor);
    p.stroke(textColor);

    timestamp = d3.select(syncId).node().currentTime;

    audioIdx = Math.round(timestamp / 0.02);
    timestamp = p.round(timestamp);
    // drawChromagram(width / 2, height / 2, 100, 100);
    if (addBeat()) {
      // console.log(imageSceneEntry[timestamp]);
      let colorslist = imageSceneEntry[timestamp]["colors"];
      bgColor = colorslist[0];
      textColor = colorslist[colorslist.length - 1];
    }
    drawDynamicFont(
      p,
      dynamicFontType,
      getNormalizedFeature("mfcc"),
      textContent,
      font,
      textX,
      textY,
      textWidth
    );
  };

  function setupFeatureRanges() {
    for (let mfccNum = 0; mfccNum < 12; mfccNum++) {
      const featureName = `mfcc_${mfccNum + 1}`;
      const min = p.min(audioSceneEntry[featureName]);
      const max = p.max(audioSceneEntry[featureName]);
      mfcc_ranges[featureName] = [min, max];
    }
  }

  function getNormalizedFeature(feature) {
    if (feature == "mfcc" || feature == "chroma") {
      let featureList = [];
      for (i = 1; i <= 12; i++) {
        let val = audioSceneEntry[`${feature}_${i}`][audioIdx];
        if (feature == "chroma") {
          featureList.push(val);
        } else {
          let [min, max] = mfcc_ranges[`${feature}_${i}`];
          let normalizedVal = p.map(val, min, max, 0, 1);
          featureList.push(normalizedVal);
        }
      }
      return featureList;
    }
  }

  function addBeat() {
    const numBeats = audioSceneEntry["beat_times"].length;

    for (let i = 0; i < numBeats; i++) {
      const beat_time = audioSceneEntry["beat_times"][i];
      if (Math.abs(beat_time - d3.select(syncId).node().currentTime) < 0.02) {
        return true;
      }
    }
    return false;
  }

  function drawChromagram(x, y, chromagramW, noteH) {
    p.push();
    let chromaX = x - chromagramW / 2;
    let xpos = chromaX;
    const noteW = chromagramW / (pitches.length - 5);
    for (let chromaNum = 0; chromaNum < 12; chromaNum++) {
      // console.log(pitches[chromaNum]);
      const chromaVal = audioSceneEntry[`chroma_${chromaNum + 1}`][audioIdx];
      if (pitches[chromaNum].length > 1) {
        p.noStroke();
        p.fill("black");
        xpos = chromaX - noteW * 0.5 + noteW / 2;
        p.rect(
          chromaX - noteW * 0.5 + noteW / 4,
          y,
          noteW / 2,
          ((noteH * 2) / 3) * p.map(chromaVal, 0, 1, 1, 2)
        );
      } else {
        p.noFill();
        p.stroke("black");

        p.rect(chromaX, y, noteW, noteH * p.map(chromaVal, 0, 1, 1, 2));
        xpos = chromaX + noteW / 2;
        chromaX += noteW;
      }
      p.noFill();
      p.stroke(bgColor);
      p.rect(0, 0, 1, 1);
      const fSize = p.map(chromaVal, 0, 1, 5, 20);
      p.fill("black");
      p.textSize(fSize);
      p.text(pitches[chromaNum], xpos, y - 10);
    }

    p.pop();
  }
};
