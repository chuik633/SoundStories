let font;
const width = window.innerWidth;
const height = window.innerHeight - 50;
let textColor = "white";
let bgColor = "black";
//font variables
let caption = "caption";
let maxFontSize = 100;
let sampleFac = 0.8;

//sound variables
let fft;
let amplitude;
let sound;

//visual variables
let max_pull = 1; //strength
let stepsize = 5; //sample rate
let num_bins = 10;

let presets = {
  kumon: {
    max_pull: 2,
    stepsize: 2,
    num_bins: 10,
    textColor: "#3F95BC",
    bgColor: "#050C17",
    caption: "KUMON",
    fontFace: "LexendTera-Bold.ttf",
    sound: "severance.mp3",
  },
};

//saved font lines
let line_segments = [];

//image
let img;

function preload() {
  font = loadFont("./styles/LexendTera-Bold.ttf");
  sound = loadSound("./sounds/cornfieldchase.mp3");
  img = loadImage("./images/blackhole2.png");
}

function setup() {
  textFont(font);
  createCanvas(width, height);
  background("white");
  angleMode(RADIANS);

  //draw the first layer
  draw_underlay(caption, width / 2, height / 2, "black");
  // image(img, 0, 0, width, height);

  //process screen
  processScreen(5, "black", 80);

  //create fft
  fft = new p5.FFT();

  //sound buttons
  createButton("play").mousePressed(start);
  createButton("stop").mousePressed(stop);
}

function draw() {
  background(bgColor);

  let max_r = dist(width / 2, height / 2, 0, 0);
  let spectrum_points = get_spectrum_points();
  for (const loc of spectrum_points) {
    stroke(textColor);
    strokeWeight(1);
    line(width / 2, height / 2, loc.x, loc.y);
    strokeWeight(0.05);
    drawLineSegments(max_r, loc.x, loc.y);
  }

  //draw the lines
  // drawLineSegments(max_r, mouseX, mouseY)
  // filter(BLUR, 3);
  // draw_underlay(caption,width/2,height/2, bgColor)
  blendMode(BLEND);
}

function get_spectrum_points(centerx, centery) {
  //spectrum info
  let spectrum = fft.analyze();

  //bin info
  let bin_size = Math.round(spectrum.length / num_bins);
  let bin_angle_size = (2 * Math.PI) / num_bins;
  let bin_locations = [];

  //max radius
  let max_r = dist(width / 2, height / 2, 0, 0);

  //tierate thru the bins and do the stuf
  for (let bin = 0; bin < num_bins; bin++) {
    let bin_amp_avg = 0;
    for (let i = bin * bin_size; i < (bin + 1) * bin_size; i++) {
      bin_amp_avg += spectrum[i] / bin_size;
    }
    if (isNaN(bin_amp_avg)) {
      bin_amp_avg = 0;
    }
    //position should be on the same angle
    let bin_angle = bin * bin_angle_size;
    let r = map(log(bin_amp_avg + 1), 1, log(256), 100, max_r);
    // let r = map(bin_amp_avg,0,255,100,max_r)
    let x = Math.min(r * cos(bin_angle), width / 2);
    let y = Math.min(r * sin(bin_angle), height / 2);

    //save the info
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
  //load the pixels and get the density
  loadPixels();
  let pd = pixelDensity();

  // console.log("processing", pixels)
  for (let y = 0; y < height; y += stepsize) {
    for (let x = 0; x < width; x += stepsize) {
      let index = (x * pd + y * pd * width * pd) * 4;

      let r = pixels[index];
      let g = pixels[index + 1];
      let b = pixels[index + 2];
      if (colorDistance(selectedColor, color(r, g, b)) < tolerance) {
        line_segments.push([x, y, x - stroke_len, y - stroke_len]);
      }
    }
  }
}

function drawLineSegments(maxDistance, dirX, dirY) {
  stroke(textColor);
  noFill();
  for (const [x1, y1, x2, y2] of line_segments) {
    let dist1 = dist(x1, y1, dirX, dirY);
    let dist2 = dist(x2, y2, dirX, dirY);

    let midpointx = (x1 + x2) / 2;
    let midpointy = (y1 + y2) / 2;

    let pullFactor = constrain(
      map(max(dist1, dist2), 0, maxDistance, max_pull, 0),
      0,
      max_pull
    );
    let pulledMidpointX = midpointx + (dirX - midpointx) * pullFactor;
    let pulledMidpointY = midpointy + (dirY - midpointy) * pullFactor;

    let n_zoom = 0.005;
    let n_speed = 0.01;
    let n_size = 10;
    let n =
      (noise(
        pulledMidpointX * n_zoom,
        pulledMidpointY * n_zoom,
        frameCount * n_speed
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

function draw_underlay(inputText, x, y, c) {
  let fontSize = getResizedFontSize(caption, maxFontSize, width - 50);
  textSize(fontSize);
  noStroke();
  fill(c);

  //text positioning
  let textWidth = inputText.length * fontSize;
  x -= textWidth / 2; //shift it so its centered

  //show text
  text(inputText, x, y);
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
function drawCurvedLine(x1, y1, x2, y2, mx, my) {
  let controlX1 = (x1 + mx) / 2;
  let controlY1 = (y1 + my) / 2;
  let controlX2 = (x2 + mx) / 2;
  let controlY2 = (y2 + my) / 2;

  beginShape();
  vertex(x1, y1);
  bezierVertex(controlX1, controlY1, controlX2, controlY2, x2, y2);
  endShape();
}

function start() {
  sound.play(0, 1, 2, 40);
}
function stop() {
  sound.stop();
}

function colorDistance(c1, c2) {
  let r1 = red(c1),
    g1 = green(c1),
    b1 = blue(c1);
  let r2 = red(c2),
    g2 = green(c2),
    b2 = blue(c2);
  let distance = dist(r1, g1, b1, r2, g2, b2);
  return distance;
}
