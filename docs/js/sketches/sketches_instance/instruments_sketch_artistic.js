const instrumentSketch = (p, parentDiv, movieName, sceneNum) => {
  const syncId = "#displayed-video";
  let font;
  let audioSceneEntry;
  let imageSceneEntry;
  let timestamp = 0;
  let audioIdx;
  let mfcc_ranges = {};

  let beats = [];
  let lastBeat = 0;
  //dynamic font stuff
  const dynamicFontOptions = ["wiggly", "strings", "flow", "blur", "swirl"];
  const dynamicFontType = "blur";
  let width = window.innerWidth;
  let height = (window.innerHeight * 2) / 3 - 100;
  const textX = width / 2;
  const textY = height / 2;
  const textWidth = width - 80;
  const textContent = movieName;
  let textColor = "black";
  let bgColor;
  brush.instance(p);
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

    const canvas = p.createCanvas(width, height, p.WEBGL);
    canvas.parent(parentDiv);
    p.background(bgColor);
    p.textFont(font);

    setupFeatureRanges();
    brush.load();
  };

  let mode = 0;
  p.draw = () => {
    p.fill(textColor);
    p.stroke(textColor);
    p.background(bgColor);
    if (mode == 0) {
      p.background(bgColor);
    }

    timestamp = d3.select(syncId).node().currentTime;

    audioIdx = Math.round(timestamp / 0.02);
    timestamp = p.round(timestamp);
    brush.push();
    drawGuitarNotes(-350, -100, 300, 200);
    brush.pop();

    brush.push();
    drawChromagram(200, -100, 300, 200);
    brush.pop();
    if (addBeat()) {
      p.background(bgColor);
      // console.log(imageSceneEntry[timestamp]);
      let imgIdx = Math.floor(timestamp / imageSR);
      let colorslist = imageSceneEntry[imgIdx]["colors"];
      textColor = colorslist[0];
      // textColor = colorslist[colorslist.length - 1];
    }
    drawBeats();
    if (mode == 1) {
      // drawMFCCS();
    }
  };
  p.mouseClicked = function () {
    console.log("mode change", mode);
    mode = (mode + 1) % 3;
    console.log("mode change", mode);
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
    let x = -width / 2;
    let imgIdx = Math.floor(timestamp / imageSR);
    for (const c of imageSceneEntry[imgIdx]["colors"]) {
      brush.setHatch("hatch_brush", c);
      brush.hatch(10, 20);
      brush.rect(x, -height / 2, 50, 50);
      x += 50;
    }
  }
  function addBeat() {
    let imgIdx = Math.floor(timestamp / imageSR);
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
          .range([50, width - 50]);
        lastBeat = {
          x: beatXScale(beat_time) + 10,
          y: rowNum * beatySize + 10,
          c: imageSceneEntry[imgIdx]["colors"][0],
          c2: imageSceneEntry[imgIdx]["colors"][1],
        };

        beats.push(lastBeat);
        lastBeat["x2"] = p.random(-width / 2 + 50, width / 2 - 50);
        lastBeat["y2"] = p.random(-height / 2 + 50, height / 2 - 50);
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
        brush.noFill();
        brush.setHatch("HB", textColor);
        brush.set("HB", textColor, p.map(chromaVal, 0, 1, 0.1, 3));
        xpos = chromaX - noteW * 0.5 + noteW / 2;
        if (chromaVal > 0.001) {
          let hatchVal = p.constrain(
            p.round(p.map(chromaVal, 0, 0.2, 5, 1)),
            1,
            5
          );
          brush.hatch(hatchVal, 20);
          // brush.hatch(hatchVal, 10, {
          //   rand: 0.1,
          //   gradient: 0.3,
          // });
        }
        brush.rect(
          chromaX - noteW * 0.5 + noteW / 4,
          y,
          noteW / 2,
          ((noteH * 2) / 3) * p.map(chromaVal, 0, 1, 1, 2)
        );
      } else {
        // if (chromaVal > 0.001) {
        //   brush.fill("#B0C4BF", p.map(chromaVal, 0, 0.5, 30, 100));
        // }
        brush.set("HB", textColor, p.map(chromaVal, 0, 1, 0.5, 3));

        brush.noHatch();
        brush.rect(chromaX, y, noteW, noteH * p.map(chromaVal, 0, 1, 1, 3));
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
    let imgIdx = Math.floor(timestamp / imageSR);
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
    brush.noHatch();
    p.push();
    brush.noField();
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

        if (chromaVal > 0.015) {
          const curveStrength = p.map(chromaVal, 0, 1, 0, stringSpacing * 4);

          brush.set("HB", textColor, 1);

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
    brush.beginShape(0.5);
    brush.vertex(x1, y1);
    // brush.field("curved");
    brush.noField;

    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const xt = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
      const yt = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;

      brush.vertex(xt, yt);
    }

    // End
    brush.vertex(x2, y2);

    brush.endShape();
  }
  function drawBeats(fill = false) {
    let imgIdx = Math.floor(timestamp / imageSR);
    p.push();
    // brush.field("waves");
    //draw all beats

    brush.set("HB", imageSceneEntry[imgIdx]["colors"][0], 1);
    for (const beat of beats) {
      brush.stroke(beat.c);

      brush.circle(beat.x - width / 2, beat.y - height / 2, 2);
    }

    if (fill) {
      //random fil stuff
      brush.fill(
        p.random(imageSceneEntry[imgIdx]["colors"]),
        p.random(60, 140)
      );
      brush.bleed(p.random(0.05, 0.4));
      brush.fillTexture(0.55, 0.5);
      brush.noStroke();
      brush.rect(
        p.random(-width / 2 + 50, width / 2 - 50),
        p.random(-height / 2 + 50, height / 2 - 50),
        p.random(10, 50),
        p.random(10, 50)
      );
    } else {
      brush.setHatch("HB", lastBeat.c2);
      brush.hatch(3, p.random() * 180);
      brush.noStroke();
      brush.rect(lastBeat.x2, lastBeat.y2, lastBeat.w, lastBeat.h);
    }

    p.pop();
  }
};
