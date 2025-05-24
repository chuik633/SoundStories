

const width = window.innerWidth
const height = window.innerHeight-20


//font variables (these we can make globals in the instance mode)
let font;
let letters = "hello world"
let fontSize = 100
let sampleFac = .2
let particles = []
let x_threshold = 1;

const particleColor = 'white'
const backgroundColor = [0,0,0]

//sound variables these are replaced with data
const nbins = 32;
const binstoVis = 12
let fft;
let sound;

function preload(){
    font = loadFont('./styles/Jost-Bold.ttf')
    sound = loadSound("./sounds/thingstosay.mp3");
}
function setup(){
  textFont(font);
  fft = new p5.FFT(0.8, nbins);

  createCanvas(width, height);
  background(backgroundColor);

  setup_letters();
  //sound buttons
  createButton("play").mousePressed(start);
  createButton("stop").mousePressed(stop);
}
function draw(){
    noStroke()
    fill([...backgroundColor,15]);
    rect(0,0,width, height)
    tint(255, 255);

    let spectrum = fft.analyze()
    const particles_per_bin = Math.floor(particles.length / binstoVis);
    for (let binNum = 0; binNum < binstoVis; binNum++) {
      let amp = spectrum[binNum];
     
      if(amp>0){
        for (
          let i = binNum * particles_per_bin;
          i < (binNum + 1) * particles_per_bin;
          i++
        ) {
          //  ellipse(particles[i].pos.x, particles[i].pos.y, 1, 1);

          particles[i].noiseZoom = map(amp, 0, 200, 0.00001, 0.1);
          particles[i].speed = map(amp, 0, 200, 0.001, 5);
          particles[i].noiseMag = map(amp, 0, 200, 0.001, 0.5);

          particles[i].run();
        }

      }
        

    }
}



function setup_letters(){
    //positioning
    fontSize = getResizedFontSize(letters, fontSize, width - 50)

    let textWidth = (letters.length)*fontSize
    let x = width/2 - textWidth/2
    let y = height/2 +100 //center

    //getting the letter points
    for(const letter of letters){
      console.log("FACTOR", sampleFac)
        let letter_points = font.textToPoints(
            letter,
            x,
            y,
            fontSize,
            { sampleFactor:  sampleFac}
        )
        let letterLines = get_shape_lines(letter_points);
        for(let [x1,y1,x2,y2] of letterLines){
          let startPos = { x: x1, y: y1 };
          let endPos = { x: x2, y:y2 };
          let particle = new Particle(startPos, endPos, 1);
           let particle2 = new Particle(endPos,startPos, 1);
          particles.push(particle);
          particles.push(particle2);

        }


        x+=fontSize
    }
}

function drawLetter(points){
    fill(particleColor)
    beginShape()
    for(const point of points){   
        vertex(point.x, point.y)
    }
    endShape()
}


class Particle {
  constructor(pos, endPos, speed) {
    this.noiseZoom = 0.001;
    this.noiseSpeed = 0.01;
    this.noiseMag = 0.5;
    this.origionPos = { x: pos.x, y: pos.y };
    this.endPos = endPos;
    this.pos = pos;
    let angle = Math.atan2(pos.y - endPos.y, pos.x - endPos.x);
    this.dir = { x: cos(angle), y: sin(angle) };
    this.speed = speed;
  }

  run() {
    this.move();
    this.checkEdges();
    this.update();
  }
  move() {
    //compute the angle
    let dx = this.endPos.x - this.pos.x;
    let dy = this.endPos.y - this.pos.y;
    let angle = Math.atan2(dy, dx);
    let angleNoise =
      noise(
        this.pos.x * this.noiseZoom,
        this.pos.y * this.noiseZoom,
        frameCount * this.noiseSpeed
      ) *
      TWO_PI *
      this.noiseMag;
    //save the angle
    this.dir.x = cos(angle + angleNoise);
    this.dir.y = sin(angle + angleNoise);

    //update the positions by moving the current position in the x, y speed
    this.pos.x += this.dir.x * this.speed;
    this.pos.y += this.dir.y * this.speed;
  }

  checkEdges() {
    console.log(dist(this.pos.x, this.pos.y, this.endPos.x, this.endPos.y));
    if (dist(this.pos.x, this.pos.y, this.endPos.x, this.endPos.y) < 10) {
      let copyend = this.endPos;
      this.endPos = this.origionPos;
      this.origionPos = copyend;
        this.pos.x = this.origionPos.x;
        this.pos.y = this.origionPos.y;
    }if (
      this.pos.x < 0 ||
      this.pos.x > width ||
      this.pos.y < 0 ||
      this.pos.y > height
    ) {
    //   this.pos.x = random(width * 1.2);
    //   this.pos.y = random(height);
      this.pos = this.origionPos;
    }
  }
  update() {
    fill(particleColor);
    ellipse(this.pos.x, this.pos.y, 1, 1);
  }
}

/**
 * helper function to get resized font size
 */
function getResizedFontSize(inputText, currFontSize, max_size){
    const inputLetters = inputText.split("")
    let squishedFontSize = currFontSize
    // console.log(letters)

    // squeeze the width to fit
    
    while((inputLetters.length)*squishedFontSize > max_size){
        squishedFontSize -=1
    }
    // sampleFac = map(squishedFontSize, 10, 100, .8, .3)
    return squishedFontSize
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
      let avgy =
        y_line_vals.reduce((acc, num) => acc + num, 0) / y_line_vals.length;
      all_lines.push([x, Math.max(...y_line_vals), x, avgy]);
      all_lines.push([x, avgy, x, Math.min(...y_line_vals)]);
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



function lowerOpacity(hex, a) {
  hex = hex.replace("#", "");

  var bigint = parseInt(hex, 16);

  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  let c = color(`rgba(${r}, ${g}, ${b}, ${a})`);
  return c;
}