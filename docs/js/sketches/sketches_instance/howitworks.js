const howitworks = (p, container) => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  const movieName = "Call Me by Your Name";
  let sound;
  let font;
  let playing = false;
  let btn;
  let audioSceneEntry;
  let imageSceneEntry;
  let timestamp = 0;
  let audioIdx;
  let mfcc_ranges = {};
  let feature_ranges = {};
  let beats = [];

  //dynamic font stuff
  const dynamicFontOptions = ["wiggly", "strings", "flow", "blur", "swirl"];
  const dynamicFontType = "annotated-strings";
  const textX = width / 2;
  const textY = height / 2;
  const textWidth = width - 80;
  const textContent = ["HOW", "IT", "WORKS"];
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

  p.preload = () => {
    sound = p.loadSound(`./data/${movieName}/audios/0.wav`);
    font = p.loadFont("./styles/fonts/Jost-Bold.ttf");
    audioSceneEntry = p.loadJSON(`./data/${movieName}/audioSceneData.json`);
  };

  p.setup = () => {
    const parentRect = container.getBoundingClientRect();
    // width = parentRect.width;
    // height = parentRect.height;
    const canvas = p.createCanvas(width, height);
    canvas.parent(container);

    bgColor = "white";
    audioSceneEntry = audioSceneEntry[0];

    const btn = document.getElementById("pause-play-container");
    btn.addEventListener("click", toggleplaying);
    p.background(bgColor);
    p.textFont(font);

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
    setupFeatureRanges();
    p.fill(textColor);
    p.stroke(textColor);
    timestamp = p.round(sound.currentTime());
    audioIdx = Math.round(sound.currentTime() / 0.02);
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

    const introSection = document.getElementById("sketch-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            console.log("pausing sound");
            const btn = document.getElementById("pause-play-container");
            if (btn) {
              btn.click(); // simulate real click
            }
          }
        });
      },
      {
        threshold: 0,
      }
    );
    observer.observe(introSection);
  };

  p.draw = () => {
    p.background(bgColor);
    // if (sound.isPlaying()) {
    p.fill(textColor);
    p.stroke(textColor);
    timestamp = p.round(sound.currentTime());
    audioIdx = Math.round(sound.currentTime() / 0.02);
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
    // }
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
      if (Math.abs(beat_time - sound.currentTime()) < 0.02) {
        console.log("beat");
      }
    }
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

  function drawMFCCS() {
    p.push();
    p.translate(-width / 2, -height / 2);
    const xSize = width / 12;
    const hSize = height / 12;
    for (let mfccNum = 0; mfccNum < 12; mfccNum++) {
      const [minMFCC, maxMFCC] = mfcc_ranges[`mfcc_${mfccNum + 1}`];
      const mfccVal = audioSceneEntry[`mfcc_${mfccNum + 1}`][audioIdx];
      const normalVal = p.map(mfccVal, minMFCC, maxMFCC, 0, 1);
      p.map(normalVal, 0, 1, 30);
      createBuilding(xSize * mfccNum, 0, 0, l, w, h);
    }
    p.pop();
  }

  function toggleplaying() {
    if (!playing) {
      sound.play(0, 1, 2, 50);
      playing = true;
    } else {
      sound.pause();
      playing = false;
    }
  }
};
