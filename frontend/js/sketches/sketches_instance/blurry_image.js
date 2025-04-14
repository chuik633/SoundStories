/**
 * p; the sketc instance
 * parentDiv; the div to fit the canvas to
 * sceneNum; the int for the scene index for the data
 */
const blury_image = (p, parentDiv, sceneNum) => {
      const syncId = "#displayed-video";
  //data variables
  const img_path = `${imgDir}${sceneNum}.png`;
  const imgEntry = imageSceneData[sceneNum];
  const audioEntry = audioSceneData[sceneNum];
  const captionSceneEntry = captionData[sceneNum];
  const audio_path = `${audioDir}${sceneNum}.png`;

  //audio variables
  let timestamp, shortIdx, captionIdx;
  let mcc_list;
  let caption;
  let min_val = 0.00001
  let max_val= 1

  //canvas variables
  let width, height;

  //text variables
  let font;
  let maxFontSize = 50;
  let sampleFac = 0.8;


  //saved font lines
    let img;
  let line_segments = [];

  let textColor = imgEntry["colors"][1];
  let bgColor = 'black';
  let max_pull = .5;
  let stepsize = 4;
  let num_bins = 12;
  let bin_size;

  p.preload = function () {
    img = p.loadImage(img_path);
    font = p.loadFont("styles/fonts/Jost-Bold.ttf");
  };

  p.setup = function () {
    //instance mode set up DO THIS FOR ALL
    const parentRect = parentDiv.getBoundingClientRect();
    width = parentRect.width;
    height = parentRect.height;

    //bind canvas to parent
    const canvas = p.createCanvas(width, height);
    canvas.parent(parentDiv);

    //skektch se tup stuff
    p.textFont(font);
    p.background(bgColor);
    p.angleMode(p.RADIANS);
    p.image(img, 0,0,width, height)
    processScreen(5, 'black', 100);
    // processScreen(5, imgEntry["colors"][0], 50);
  };

  p.draw = function () {
    syncData();
     p.background(bgColor);
     let max_r = p.dist(width / 2, height / 2, 0, 0);
     let audio_list_points = get_audio_list_points(chromagram_list);
    //  console.log(audio_list_points);
    let i=0

     for (const loc of audio_list_points) {
        i++;
        let color_idx = Math.floor(i / bin_size) % imgEntry['colors'].length;
       p.stroke(imgEntry["colors"][color_idx]);
       p.strokeWeight(1);
       p.line(width / 2, height / 2, loc.x, loc.y);
       p.strokeWeight(0.1);
       drawLineSegments(max_r, loc.x, loc.y);
     }
     p.blendMode(p.BLEND);
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
  }

function get_audio_list_points(audio_list) {
  bin_size = Math.round(audio_list.length / num_bins);
  let bin_angle_size = (2 * Math.PI) / num_bins;
  let bin_locations = [];
  let max_r = p.dist(width / 2, height / 2, 0, 0);
  for (let bin = 0; bin < num_bins; bin++) {
    let bin_amp_avg = 0;
    for (let i = bin * bin_size; i < (bin + 1) * bin_size; i++) {
      bin_amp_avg += audio_list[i] / bin_size;
    }
    if (isNaN(bin_amp_avg)) {
      bin_amp_avg = 0;
    }
    // console.log(bin_amp_avg)
    let bin_angle = bin * bin_angle_size;
    let r = p.map(Math.log(bin_amp_avg), Math.log(min_val), Math.log(max_val), 3, max_r);
    let x = Math.min(r * Math.cos(bin_angle), width / 2);
    let y = Math.min(r * Math.sin(bin_angle), height / 2);
    bin_locations.push({
      x: x + width / 2,
      y: y + height / 2,
      r: r,
      txt: `${Math.round(bin * bin_size)}:${Math.round((bin + 1) * bin_size)}`,
    });
  }
  return bin_locations;
}

  function processScreen(stroke_len, selectedColor, tolerance) {
    p.loadPixels();
    let pd = p.pixelDensity();
    for (let y = 0; y < height; y += stepsize) {
      for (let x = 0; x < width; x += stepsize) {
        let index = (x * pd + y * pd * width * pd) * 4;
        let r = p.pixels[index];
        let g = p.pixels[index + 1];
        let b = p.pixels[index + 2];
        if (colorDistance(selectedColor, p.color(r, g, b)) < tolerance) {
          line_segments.push([x, y, x - stroke_len, y - stroke_len]);
        }
      }
    }
  }

  function drawLineSegments(maxDistance, dirX, dirY) {
    p.noFill();
    for (const [x1, y1, x2, y2] of line_segments) {
      let dist1 = p.dist(x1, y1, dirX, dirY);
      let dist2 = p.dist(x2, y2, dirX, dirY);
      let midpointx = (x1 + x2) / 2;
      let midpointy = (y1 + y2) / 2;
      let pullFactor = p.constrain(
        p.map(Math.max(dist1, dist2), 0, maxDistance, max_pull, 0),
        0,
        max_pull
      );
      let pulledMidpointX = midpointx + (dirX - midpointx) * pullFactor;
      let pulledMidpointY = midpointy + (dirY - midpointy) * pullFactor;
      let n_zoom = 0.005;
      let n_speed = 0.01;
      let n_size = 10;
      let n =
        (p.noise(
          pulledMidpointX * n_zoom,
          pulledMidpointY * n_zoom,
          p.frameCount * n_speed
        ) *
          2 -
          1) *
        n_size;
      drawCurvedLine(
        x1 + n,
        y1 + n,
        x2 + n,
        y2 + n,
        pulledMidpointX,
        pulledMidpointY
      );
    }
  }

  function drawCurvedLine(x1, y1, x2, y2, mx, my) {
    let controlX1 = (x1 + mx) / 2;
    let controlY1 = (y1 + my) / 2;
    let controlX2 = (x2 + mx) / 2;
    let controlY2 = (y2 + my) / 2;
    p.beginShape();
    p.vertex(x1, y1);
    p.bezierVertex(controlX1, controlY1, controlX2, controlY2, x2, y2);
    p.endShape();
  }
  function colorDistance(c1, c2) {
    let r1 = p.red(c1),
      g1 = p.green(c1),
      b1 = p.blue(c1);
    let r2 = p.red(c2),
      g2 = p.green(c2),
      b2 = p.blue(c2);
    let distance = p.dist(r1, g1, b1, r2, g2, b2);
    return distance;
  }
};
