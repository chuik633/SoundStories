function sketch_loadingGrain(p, parentDiv) {
  //font variables (these we can make globals in the instance mode)
  let font;
  let letters = "S O U N D  S T O R I E S";
  let fontSize = 80;
  let sampleFac = 0.1;
  let particles = [];
  const particleColor = "white";
  const backgroundColor = [0, 0, 0];

  //sound variables these are replaced with data
  const nbins = 32;
  const binstoVis = 12;

  let fft;
  let audioContext;
  let analyserNode;


  p.preload = function(){
    font = p.loadFont('./styles/fonts/Jost-Bold.ttf')
  }

  p.setup = function () {
    
    p5grain.setup({
      instance: p,
      ignoreWarnings: true,
      ignoreErrors: true,
    });

    //set up the audio stuff
    audioContext = p.getAudioContext();
    analyserNode = audioContext.createAnalyser();

    //connect audio elements
    let audioElements = document.querySelectorAll("audio, video");
    audioElements.forEach((audioElement) => {
      let sourceNode = audioContext.createMediaElementSource(audioElement);
      sourceNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
    });

    fft = new p5.FFT(0.8, nbins);
    fft.setInput(analyserNode);

    //create the canvas
    const canvas = p.createCanvas(width, height);
    canvas.parent(parentDiv);

    //drawing set up
    p.textFont(font);
    drawLetters(p, letters);
  };
  p.draw = function () {
    p.clear();
    p.noStroke();
    p.ellipse(p.mouseX, p.mouseY, 5, 5);

    let spectrum = fft.analyze();
    const particles_per_bin = Math.floor(particles.length / binstoVis);
    for (let binNum = 0; binNum < binstoVis; binNum++) {
      let amp = spectrum[binNum];
      if (amp > 0) {
        for (let i = binNum * particles_per_bin;i < (binNum + 1) * particles_per_bin;i++) {
          particles[i].noiseZoom = p.map(amp, 0, 200, 0.0001, 0.5);
          particles[i].speed = p.map(amp, 0, 200, 0.001, 4);
          particles[i].noiseMag = p.map(amp, 0, 200, 0.001, 0.5);
          particles[i].run(p);
        }
      }
    }

    // p.background('pink')
    // p.applyMonochromaticGrain(50);
  };

  function drawLetters(p, letters) {
    fontSize = getResizedFontSize(p, letters, 32, p.width - 50);

    let textWidth = letters.length * fontSize;
    let x = p.width / 2 - textWidth / 2;
    let y = p.height / 2;

    for (const letter of letters) {
      let letter_points = font.textToPoints(letter, x, y, fontSize, {
        sampleFactor: sampleFac,
      });
      for (const point of letter_points) {
        let endPos = { x: point.x, y: point.y - 100 };
        let speed = 2;
        let particle = new Particle(point, endPos, speed);
        particles.push(particle);
        p.fill("white");
        p.ellipse(point.x, point.y, 1, 1);
      }

      x += fontSize;
    }
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
      this.dir = { x: p.cos(angle), y: p.sin(angle) };
      this.speed = speed;
    }

    run(p) {
      this.move(p);
      this.checkEdges(p);
      this.update(p);
    }

    move(p) {
      let dx = this.endPos.x - this.pos.x;
      let dy = this.endPos.y - this.pos.y;
      let angle = Math.atan2(dy, dx);
      let angleNoise =
        p.noise(
          this.pos.x * this.noiseZoom,
          this.pos.y * this.noiseZoom,
          p.frameCount * this.noiseSpeed
        ) *
        p.TWO_PI *
        this.noiseMag;
      this.dir.x = p.cos(angle + angleNoise);
      this.dir.y = p.sin(angle + angleNoise);

      this.pos.x += this.dir.x * this.speed;
      this.pos.y += this.dir.y * this.speed;
    }

    checkEdges(p) {
      if (p.dist(this.pos.x, this.pos.y, this.endPos.x, this.endPos.y) < 10) {
        let copyend = this.endPos;
        this.endPos = this.origionPos;
        this.origionPos = copyend;
        this.pos.x = this.origionPos.x;
        this.pos.y = this.origionPos.y;
      }
      if (
        this.pos.x < 0 ||
        this.pos.x > p.width ||
        this.pos.y < 0 ||
        this.pos.y > p.height
      ) {
        this.pos = this.origionPos;
      }
    }

    update(p) {
      p.fill(particleColor);
      p.ellipse(this.pos.x, this.pos.y, 1, 1);
    }
  }

  function getResizedFontSize(p, inputText, currFontSize, max_size) {
    const inputLetters = inputText.split("");
    let squishedFontSize = currFontSize;

    while (inputLetters.length * squishedFontSize > max_size) {
      squishedFontSize -= 1;
    }
    sampleFac = p.map(squishedFontSize, 10, 100, 0.8, 0.3);
    return squishedFontSize;
  }
}


