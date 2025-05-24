

const width = window.innerWidth
const height = window.innerHeight-100


//font variables (these we can make globals in the instance mode)
let font;
let letters = "hello world"
let fontSize = 80
let sampleFac = .001
let particles = []

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

  drawLetters();
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
      if (amp > 0) {
        for (
          let i = binNum * particles_per_bin;
          i < (binNum + 1) * particles_per_bin;
          i++
        ) {
          // map(amp, 0, 200,);
          // let noiseSpeed = 0.001;
          // let noiseMag = 0.3;
          particles[i].noiseZoom = map(amp, 0, 200, 0.00001, 0.1);
          particles[i].speed = map(amp, 0, 200, 0.001, 2);
          particles[i].noiseMag = map(amp, 0, 200, 0.001, 0.5);
          // particles[i].noiseSpeed= map(amp, 0, 200, 0.01, 0.5);
          // setNoiseVals(
          //   map(amp, 0, 200, 0.0001, 1),
          //   map(amp, 0, 200, 0.001, 0.1)
          // );
          particles[i].run();
        }
      }
    }
}



function drawLetters(){
    //positioning
    fontSize = getResizedFontSize(letters, fontSize, width - 50)

    let textWidth = (letters.length)*fontSize
    let x = width/2 - textWidth/2
    let y = height/2 +100 //center

    //getting the letter points
    for(const letter of letters){
        let letter_points = font.textToPoints(
            letter,
            x,
            y,
            fontSize,
            { sampleFactor:  sampleFac}
        )
        for(const point of letter_points){
            let endPos = {x:point.x, y:point.y-200}
            let speed = 1
            let particle = new Particle(point, endPos, speed);
                particles.push(particle);
            fill("white")
            ellipse(point.x, point.y, 2, 2);
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
      console.log("end");
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
    sampleFac = map(squishedFontSize, 10, 100, .8, .3)
    return squishedFontSize
}


function start() {
  sound.play(0, 1, 2, 40);
}
function stop() {
  sound.stop();
}