/**
 * p; the sketc instance
 * parentDiv; the div to fit the canvas to
 * sceneNum; the int for the scene index for the data
 */
const sketch_wobbly_font = (p, parentDiv, movieName, sceneNum) => {
  //the video or audio to sync to
  const syncId = "#displayed-video";

  //data variables
  let movie = "";
  const img_path = `${metaData[movieName].imgDir}${sceneNum}.jpg`;
  const imgEntry = data[movieName].imageSceneData[sceneNum];
  const audioEntry = data[movieName].audioSceneData[sceneNum];
  const captionSceneEntry = data[movieName].captionData[sceneNum];

  //audio variables
  let timestamp, shortIdx, captionIdx;
  let mcc_list;
  let chromagram_list;
  let notes;
  let display_text;

  //range for mapping
  let min_val = -1;
  let max_val = 1;

  //canvas variables
  let width, height;

  //text variables
  let font;
  let maxFontSize = 15;
  let sampleFac = 0.8;
  const bgColor = "black";
  const textColor = "white";

  p.preload = function () {
    font = p.loadFont("styles/fonts/Jost-Bold.ttf");
  };

  p.setup = function () {
    //instance mode set up DO THIS FOR ALL
    console.log("setup, ", movieName);
    console.log(parentDiv);
    console.log("width", width, height);
    const parentRect = parentDiv.getBoundingClientRect();
    movie = movieName;
    width = parentRect.width;
    height = parentRect.height;

    //bind canvas to parent
    const canvas = p.createCanvas(width, height);
    canvas.parent(parentDiv);

    //skektch se tup stuff
    p.background(bgColor);
    p.textFont(font);
  };

  p.draw = function () {
    syncData();
    p.background(bgColor);
    p.fill(textColor);
    p.noStroke();

    //draw the caption
    if (display_text == undefined) {
      display_text = movieName;
    } else {
      console.log(display_text);
    }
    drawText(
      chromagram_list,
      display_text,
      (x = width / 2),
      (y = height / 2),
      (maxWidth = width - 50),
      (animateNoise = true),
      (animatePos = false),
      (animateSize = true)
    );
  };

  /**
   * use this for all sketches to sync data on each frame
   */
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
    // console.log(captionSceneEntry);
    for (const entry of captionSceneEntry) {
      if (timestamp > entry.start_seconds && timestamp < entry.end_seconds) {
        display_text = entry.caption;
        // console.log('caption', caption)
        display_text = entry.caption;
      }
    }
  }

  function drawText(
    input_list,
    inputText,
    x,
    y,
    maxWidth,
    animateNoise,
    animatePos,
    animateSize
  ) {
    // p.ellipse(100,100,10,10)
    //resize the font if its too big
    let fontSize = getResizedFontSize(inputText, maxFontSize, maxWidth);

    //format the sizing
    let textWidth = inputText.length * fontSize;
    x -= textWidth / 2; //shift it so its centered

    //divide the input_list up to the letters
    let sample_size = Math.round(input_list.length / inputText.length); //the size of the spectrum to correspond to each letter

    // p.fill("green");
    // p.text(inputText, x, y);
    //Draw each letter
    for (let letterIdx = 0; letterIdx < inputText.length; letterIdx++) {
      const letter = inputText[letterIdx];
      let val_average = 0;
      for (
        let i = sample_size * letterIdx;
        i < sample_size * (letterIdx + 1) && i < input_list.length;
        i++
      ) {
        val_average += input_list[i] / sample_size;
      }

      //Animate Size
      let size_shift = 1;
      // console.log(val_average)
      if (animateSize) {
        size_shift = p.map(val_average, min_val, max_val, 1, 2);
      }
      let letter_fontSize = fontSize * size_shift;

      //Animate position
      let y_shift = 0;
      if (animatePos) {
        y_shift = p.map(val_average, min_val, max_val, 0, letter_fontSize);
      }

      //Sample letter points
      // sampleFac = p.map(letter_fontSize, 10, 100, 0.8, 0.3); //set font size accordingly
      let letter_points = font.textToPoints(
        letter,
        x,
        y - y_shift,
        letter_fontSize,
        { sampleFactor: sampleFac }
      );
      // p.fill('red')
      // p.text(letter,x,y);

      //Draw letter from points
      if (animateNoise) {
        drawLetterFromPoints(letter_points, val_average, fontSize / 2);
      } else {
        drawLetterFromPoints(letter_points, val_average, 0);
      }

      //move position along
      x += letter_fontSize;
    }
  }

  function drawLetterFromPoints(points, amp, noiseSize) {
    p.fill(textColor);
    p.noStroke();
    p.beginShape();
    for (const point of points) {
      let n_zoom = 0.05;
      let n_speed = p.map(amp, min_val, max_val, 0.001, 0.05);
      let n =
        p.noise(n_zoom * point.x, n_zoom * point.x, p.frameCount * n_speed) *
        noiseSize;
      p.vertex(point.x + n, point.y + n);
    }
    p.endShape();
  }

  function getResizedFontSize(inputText, currFontSize, max_size) {
    const inputletters = inputText.split("");
    let squishedFontSize = currFontSize;

    // squeeze the width to fit
    while (inputletters.length * squishedFontSize > max_size) {
      squishedFontSize -= 1;
    }

    return squishedFontSize;
  }
};
