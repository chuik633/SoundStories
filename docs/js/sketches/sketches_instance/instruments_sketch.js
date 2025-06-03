const instrumentSketch = (p, parentDiv, movieName, sceneNum) => {
  const syncId = "#displayed-video";
  let audioSceneEntry;
  let imageSceneEntry;
  let timestamp = 0;
  let audioIdx;
  let mfcc_ranges = {};
  let imgIdx = 0;

  let beats = [];
  let lastBeat = 0;
  //dynamic font stuff

  let width = window.innerWidth;
  let height = (window.innerHeight * 2) / 3 - 100;

  let textColor = "black";
  let bgColor;

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
  let brushTypes = [
    "pen",
    "rotring",
    "2B",
    "HB",
    "2H",
    "cpencil",
    "charcoal",
    "hatch_brush",
    "spray",
    "marker",
    "marker2",
  ];

  p.preload = () => {
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

    width = parentDiv.getBoundingClientRect().width;
    if (width < 10) {
      width = 100;
    }
    height = parentDiv.getBoundingClientRect().height;
    const canvas = p.createCanvas(width, height);
    canvas.parent(parentDiv);
    p.background(bgColor);
    setupFeatureRanges();
  };

  p.draw = () => {
    bgColor = d3.select("#films-page").style("--bgColor");
    textColor = d3.select("#films-page").style("--text-color");

    p.fill(textColor);
    p.stroke(textColor);
    // p.background(bgColor);
    p.clear();

    timestamp = d3.select(syncId).node().currentTime;
    imgIdx = Math.floor(timestamp / imageSR);

    audioIdx = Math.round(timestamp / 0.02);
    timestamp = p.round(timestamp);
    drawGuitarNotes(
      width / 2 - (width * 2) / 6,
      10,
      (width * 2) / 3,
      height / 4
    );
    drawChromagram(width / 2, height / 2, (width * 2) / 3, height / 4);
    // drawChromagram(200, -100, 300, 200);

    if (addBeat()) {
      console.log("beat");
      // let colorslist = imageSceneEntry[timestamp]["colors"];
    }
    drawBeats();
    drawColors();
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
  function drawColors() {
    let y = 0;
    let size = height / imageSceneEntry[imgIdx]["colors"].length;
    for (const c of imageSceneEntry[imgIdx]["colors"]) {
      p.fill(...c);
      p.noStroke();
      p.rect(width - 10, y, 30, size);
      y += size;
    }
    p.stroke(textColor);
    p.line(width - 10, 0, width - 10, height);
  }
  function addBeat() {
    const numBeats = audioSceneEntry["beat_times"].length;
    const beatRows = p.round(numBeats ** 0.5);
    const beatCols = p.round(numBeats / beatRows);
    const beatySize = height / beatRows;
    let beatXScale;
    for (let i = 0; i < numBeats; i++) {
      const beat_time = audioSceneEntry["beat_times"][i];
      if (Math.abs(beat_time - d3.select(syncId).node().currentTime) < 0.02) {
        const rowNum = Math.floor(i / beatCols);
        const colNum = i % beatCols;
        const startIdx = rowNum * beatCols;
        const endIdx = Math.min((rowNum + 1) * beatCols - 1, numBeats - 1);
        beatXScale = d3
          .scaleLinear()
          .domain([
            audioSceneEntry["beat_times"][startIdx],
            audioSceneEntry["beat_times"][endIdx],
          ])
          .range([0, width]);
        lastBeat = {
          x: beatXScale(beat_time),
          y: 5 + rowNum * beatySize,
          c: imageSceneEntry[imgIdx]["colors"][0],
          c2: imageSceneEntry[imgIdx]["colors"][1],
        };
        // console.log(lastBeat);

        beats.push(lastBeat);
        lastBeat["x2"] = p.random(0, width);
        lastBeat["y2"] = p.random(0, height);
        lastBeat["w"] = p.random(10, 50);
        lastBeat["h"] = p.random(10, 50);

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
    // brush.field("seabed");
    for (let chromaNum = 0; chromaNum < 12; chromaNum++) {
      // console.log(pitches[chromaNum]);
      const chromaVal = audioSceneEntry[`chroma_${chromaNum + 1}`][audioIdx];
      if (pitches[chromaNum].length > 1) {
        xpos = chromaX - noteW * 0.5 + noteW / 2;
        if (chromaVal > 0.001) {
          let hatchVal = p.constrain(
            p.round(p.map(chromaVal, 0, 0.2, 5, 1)),
            1,
            5
          );
        }

        p.fill(textColor);
        p.rect(
          chromaX - noteW * 0.5 + noteW / 4,
          y,
          noteW / 2,
          ((noteH * 2) / 3) * p.map(chromaVal, 0, 1, 1, 2)
        );
      } else {
        p.noFill();
        p.stroke(textColor);

        p.rect(chromaX, y, noteW, noteH * p.map(chromaVal, 0, 1, 1, 3));
        xpos = chromaX + noteW / 2;
        chromaX += noteW;
      }
      p.noFill();
      p.stroke(bgColor);
      p.rect(0, 0, 1, 1);
      const fSize = p.map(chromaVal, 0, 1, 5, 20);
    }

    p.pop();
  }

  function drawMFCCS() {
    brush.push();
    p.push();
    brush.set("cpencil", textColor, 1);
    // p.translate(-width / 2, -height / 2);
    const xSize = width / 12;
    const hSize = height / 12;
    for (let mfccNum = 0; mfccNum < 12; mfccNum++) {
      const [minMFCC, maxMFCC] = mfcc_ranges[`mfcc_${mfccNum + 1}`];
      const mfccVal = audioSceneEntry[`mfcc_${mfccNum + 1}`][audioIdx];
      const normalVal = p.map(mfccVal, minMFCC, maxMFCC, 0, 1);
      for (let j = 0; j < 12; j++) {
        const [minMFCC2, maxMFCC2] = mfcc_ranges[`mfcc_${j + 1}`];
        const mfccVal2 = audioSceneEntry[`mfcc_${j + 1}`][audioIdx];
        const normalVal2 = p.map(mfccVal2, minMFCC2, maxMFCC2, 0, 1);

        let r = p.constrain(p.map(normalVal / 2, 0.3, 0.9, 1, 40), 1, 40);
        let n =
          (p.noise(mfccVal * 0.5, j * 0.5, p.frameCount * 0.0001) - 0.5) *
          xSize;
        let weight = p.constrain(p.map(normalVal / 2, 0.3, 0.9, 0.1, 2), 1, 5);
        brush.pick(p.random(["HB", "charcoal", "cpencil", "2H", "2B"]));

        brush.noFill();
        brush.stroke(
          imageSceneEntry[imgIdx]["colors"][
            (mfccNum + j) % imageSceneEntry[imgIdx]["colors"].length
          ]
        );

        brush.strokeWeight(weight);
        brush.rect(
          xSize / 2 + xSize * mfccNum - width / 2 + n,
          hSize / 2 + hSize * j - height / 2 + n,
          r,
          r
        );
      }
    }
    p.pop();
    brush.pop();
  }

  function drawGuitarNotes(x, y, gridWidth, gridHeight) {
    p.push();
    p.stroke(textColor);
    p.noFill();
    const strings = ["E", "A", "D", "G", "B", "E"];

    const numFrets = 13;
    const stringSpacing = gridHeight / strings.length;
    const fretSpacing = gridWidth / numFrets;
    function getNoteAt(stringNote, fret) {
      const baseIndex = pitches.indexOf(stringNote);
      const noteIndex = (baseIndex + fret) % 12;

      return pitches[noteIndex];
    }

    for (let i = 0; i < strings.length; i++) {
      const yPos = y + i * stringSpacing;
      for (let f = 0; f < numFrets; f++) {
        const xPos = x + f * fretSpacing;
        const note = getNoteAt(strings[i], f);
        const chromaVal =
          audioSceneEntry[`chroma_${pitches.indexOf(note) + 1}`][audioIdx];
        // console.log(chromaVal);
        if (chromaVal > 0.015) {
          const curveStrength = p.map(chromaVal, 0, 1, 0, stringSpacing * 4);

          // draw pluck
          drawCurvedLine2(
            xPos,
            y, // top
            xPos,
            y + gridHeight, // bottom
            xPos + curveStrength, // side pull
            yPos
          );
        }
      }
    }
  }

  function drawCurvedLine2(x1, y1, x2, y2, mx, my) {
    p.beginShape(0.5);
    p.vertex(x1, y1);

    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const xt = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
      const yt = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;

      p.vertex(xt, yt);
    }

    // End
    p.vertex(x2, y2);

    p.endShape();
  }
  function drawBeats(fill = false) {
    p.push();
    // brush.field("waves");
    //draw all beats

    // brush.set("HB", imageSceneEntry[timestamp]["colors"][0], 1);
    for (const beat of beats) {
      if (beat.c != undefined) {
        p.fill(...beat.c);
      } else {
        p.fill("white");
      }

      p.ellipse(beat.x, beat.y, 1);
    }

    p.noStroke();

    // p.fill(...lastBeat.c);
    // p.blendMode(p.OVERLAY);
    // if (lastBeat.c != undefined) {
    //   p.fill(...lastBeat.c);
    // }
    // p.rect(lastBeat.x2, lastBeat.y2, lastBeat.w, lastBeat.h);

    p.pop();
  }
};
