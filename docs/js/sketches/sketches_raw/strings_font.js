const width = window.innerWidth;
const height = window.innerHeight - 20;

//font variables (these we can make globals in the instance mode)
let font;
let letters = "caption";
let fontSize = 200;
let sampleFac = 0.8;
let lines = [];
let x_threshold = 5;

const particleColor = "white";
const backgroundColor = [0, 0, 0];

//sound variables these are replaced with data
const nbins = 32;
const binstoVis = 12;
let fft;
let sound;

function preload() {
  font = loadFont("./styles/Jost-Bold.ttf");
  sound = loadSound("./sounds/day1.mp3");
}
function setup() {
  textFont(font);
  fft = new p5.FFT(0.8, nbins);

  createCanvas(width, height);
  background(backgroundColor);

  setup_letters();
  //sound buttons
  createButton("play").mousePressed(start);
  createButton("stop").mousePressed(stop);
}
function draw() {
  noStroke();
  fill([...backgroundColor, 15]);
  rect(0, 0, width, height);
  tint(255, 255);

  let spectrum = fft.analyze();
  const lines_per_bin = Math.floor(lines.length / binstoVis);
  for (let binNum = 0; binNum < binstoVis; binNum++) {
    let amp = spectrum[binNum];
    let pull = map(amp, 0, 200, -x_threshold, x_threshold*4);
      for (
        let i = binNum * lines_per_bin;
        i < (binNum + 1) * lines_per_bin;
        i++
      ) {
        let [x1, y1, x2, y2]=lines[i]
        stroke('white')
        strokeWeight(.1)
            line(x1,y1,x2,y2)
            if (amp > 0) {
                noStroke();
                drawCurvedLine(x1, y1, x2, y2, x1 + pull, (y1 + y2) / 2);
            }
            
         
      }
    
  }
}

function setup_letters() {
  //positioning
  fontSize = getResizedFontSize(letters, fontSize, width - 50);

  let textWidth = letters.length * fontSize;
  let x = width / 2 - textWidth / 2;
  let y = height / 2 + 100; //center

  //getting the letter points
  for (const letter of letters) {
    let letter_points = font.textToPoints(letter, x, y, fontSize, {
      sampleFactor: sampleFac,
    });
    let letterLines = get_shape_lines(letter_points);
    lines = [...lines, ...letterLines];
   

    x += fontSize;
  }
}



/**
 * helper function to get resized font size
 */
function getResizedFontSize(inputText, currFontSize, max_size) {
  const inputLetters = inputText.split("");
  let squishedFontSize = currFontSize;
  // console.log(letters)

  // squeeze the width to fit

  while (inputLetters.length * squishedFontSize > max_size) {
    squishedFontSize -= 1;
  }
  // sampleFac = map(squishedFontSize, 10, 100, .8, .3)
  return squishedFontSize;
}

function start() {
  sound.play(0, 1, 2, 40);
}
function stop() {
  sound.stop();
}

//returns the vertical lines in the shape
function get_shape_lines(points) {
  let allX_vals = points.map((p) => p.x);
  let unique_xvals = simplifyList(allX_vals, x_threshold);

  let all_lines = [];
  for (const x of unique_xvals) {
    let y_line_vals = [];
    for (let point of points) {
      let [px, py] = [point.x, point.y];

      if (Math.abs(x - px) < x_threshold) {
        y_line_vals.push(py);
      }

    }
    // console.log("YLINEVALS", y_line_vals);
    if (y_line_vals.length >= 2) {
        console.log("MAX", Math.max(...y_line_vals), Math.min(...y_line_vals));
      all_lines.push([
        x,
        Math.max(...y_line_vals),
        x,
        Math.min(...y_line_vals),
      ]);
    }
  }
  return all_lines;
}

function simplifyList(lst, threshold) {
  let uniqueList = [];
  for (let v1 of lst) {
    let isUnique = true;

    for (let v2 of uniqueList) {
      if (Math.abs(v1 - v2) < threshold) {
        isUnique = false;
        break;
      }
    }
    if (isUnique) {
      uniqueList.push(v1);
    }
  }

  return uniqueList;
}

function drawCurvedLine(x1, y1, x2, y2, mx, my) {
  let controlX1 = (x1 + mx) / 2 ;
  let controlY1 = (y1 + my) / 2 ;
  let controlX2 = (x2 + mx) / 2 ;
  let controlY2 = (y2 + my) / 2 ;

  beginShape();
  fill(particleColor);
  vertex(x1, y1);
  bezierVertex(controlX1, controlY1, controlX2, controlY2, x2, y2);
  endShape();
}

function lowerOpacity(hex, a) {
  hex = hex.replace("#", "");

  var bigint = parseInt(hex, 16);

  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  let c = color(`rgba(${r}, ${g}, ${b}, ${a})`);
  return c;
}
