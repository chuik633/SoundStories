const dynamicFontSketch = (p, parentDiv, movieName, sceneNum) => {
  const syncId = "#displayed-video";
  let font;
  let audioSceneEntry;
  let imageSceneEntry;
  let captionSceneEntry;
  let timestamp = 0;
  let audioIdx;
  let mfcc_ranges = {};
  let captions = false;

  //dynamic font stuff
  const dynamicFontOptions = ["wiggly", "strings", "flow", "blur", "swirl"];
  let dynamicFontType = d3
    .select('input[name="text-type"]:checked')
    .property("value");
  let width = window.innerWidth;
  let height = (window.innerHeight * 2) / 3 - 100;
  const textX = width / 2;
  const textY = height / 2;
  const textWidth = width - 80;
  let textContent = "INTERSTELLAR";
  let textColor = "white";
  let bgColor = "#000000";

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
    if (movieName == "totoro") {
      captions = true;
      let captionpath = metaData[movieName]["mainDir"] + "captions.json";
      captionSceneEntry = p.loadJSON(captionpath);
    }
  };

  p.setup = () => {
    if (!dynamicFontOptions.includes(dynamicFontType)) {
      dynamicFontType = "wiggly";
    }
    console.log(dynamicFontType);
    audioSceneEntry = audioSceneEntry[sceneNum];
    // setup listeners
    setupListeners();

    if (captions) {
      captionSceneEntry = captionSceneEntry[0];
    }

    const canvas = p.createCanvas(width, height);
    canvas.parent(parentDiv);
    // set up settings
    p.background(bgColor);
    p.textFont(font);

    updateSketch();

    // set feature ranges
    setupFeatureRanges();
  };

  p.draw = () => {
    // p.background(bgColor);
    // console.log(bgColor);
    // p.background(...bgColor, 100);
    //  d3.select("#caption-text").property("value")
    const colorMode = d3
      .selectAll('input[name="sketch-bgMode"]:checked')
      .property("value");

    const darkMode = d3.select("#light-mode").property("checked");
    if (colorMode == "simple") {
      bgColor = d3.select("#films-page").style("--bgColor");
      textColor = d3.select("#films-page").style("--text-color");
    }

    const fadeMode = d3.select("#fade-mode").property("checked");
    if (fadeMode) {
      let c = p.color(bgColor);
      c.setAlpha(20);
      p.fill(c);
      p.rect(0, 0, p.width, p.height);
    } else {
      p.background(bgColor);
    }

    p.fill(textColor);
    p.stroke(textColor);

    timestamp = d3.select(syncId).node().currentTime;

    audioIdx = Math.round(timestamp / 0.02);
    timestamp = p.round(timestamp);
    // drawChromagram(width / 2, height / 2, 100, 100);
    if (addBeat()) {
      let colorslist = imageSceneEntry[timestamp]["colors"];
      if (colorMode == "sync with image") {
        bgColor = colorslist[colorslist.length - 1];
        textColor = colorslist[0];

        if (darkMode) {
          //background is dark
          bgColor = colorslist[0];
          textColor = "white";
        } else {
          if (luminance(textColor) < 50) {
            textColor = colorslist[colorslist.length - 1];
          }
          if (luminance(textColor) < 50) {
            textColor = "white";
          }
        }

        d3.select("#films-page").style("--bgColor", `rgb(${bgColor})`);
        d3.select("#films-page").style("--text-color", `rgb(${textColor})`);
      }
    }
    const audioFeature = d3
      .selectAll('input[name="audio-feature"]:checked')
      .property("value");
    // console.log(audioFeature);
    drawDynamicFont(
      p,
      dynamicFontType,
      getNormalizedFeature(audioFeature),
      textContent,
      font,
      textX,
      textY,
      textWidth
    );
    let newText = getCaption();

    if (newText != false) {
      // console.log(newText);
      if (newText != textContent) {
        textContent = newText;
        updateSketch();
        d3.select("#caption-text").property("value", textContent);
        console.log("set up new font");
      }
    }
  };

  function setupListeners() {
    d3.selectAll('input[name="text-type"]').on("change", function (event) {
      const selectedValue = this.value;
      console.log("Selected text type:", selectedValue);
      dynamicFontType = selectedValue;
      updateSketch();
    });

    d3.select("#caption-text").on("keydown", function (event) {
      if (event.key === "Enter") {
        const val = d3.select(this).property("value");
        if (val != textContent) {
          textContent = val;
          updateSketch();
        }
      }
    });
  }
  function updateSketch() {
    setupDynamicFont(
      p,
      dynamicFontType,
      [],
      textContent,
      font,
      textX,
      textY,
      textWidth
    );
  }

  function getCaption() {
    if (captions) {
      for (const captionE of captionSceneEntry) {
        // console.log(captionE, timestamp);
        if (
          timestamp > captionE.start_seconds &&
          timestamp < captionE.end_seconds
        ) {
          // console.log("here");
          return captionE.caption;
        }
      }
    }
    return false;
  }

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
  function luminance(c) {
    c = p.color(c);
    const r = p.red(c);
    const g = p.green(c);
    const b = p.blue(c);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
};
