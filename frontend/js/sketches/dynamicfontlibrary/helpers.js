const maxFontSize = 120;
/**
 * helper function to get resized font size
 */
function getResizedFontSize(inputText, currFontSize, max_size) {
  const inputletters = inputText.split("");
  let squishedFontSize = currFontSize;

  // squeeze the width to fit
  while (inputletters.length * squishedFontSize > max_size) {
    squishedFontSize -= 1;
  }

  return squishedFontSize;
}

function drawGrid(p, numRows, numCols, color, x, y, gridW, gridH) {
  const w = gridW / numCols;
  const h = w;
  p.stroke(color);
  p.strokeWeight(0.2);
  for (let j = 0; j < numRows; j++) {
    p.line(x, y + h * j, x + gridW, y + h * j);
  }
  for (let i = 0; i < numCols; i++) {
    p.line(x + i * w, y, x + i * w, y + gridH);
  }
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

function drawCurvedLine(p, x1, y1, x2, y2, mx, my) {
  let controlX1 = (x1 + mx) / 2;
  let controlY1 = (y1 + my) / 2;
  let controlX2 = (x2 + mx) / 2;
  let controlY2 = (y2 + my) / 2;

  p.beginShape();
  p.vertex(x1, y1);
  p.bezierVertex(controlX1, controlY1, controlX2, controlY2, x2, y2);
  p.endShape();
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

// Particle class
class FlowParticle {
  constructor(p, pos, endPos, speed) {
    this.p = p;
    this.noiseZoom = 0.001;
    this.noiseSpeed = 0.01;
    this.noiseMag = 0.5;
    this.origPos = { x: pos.x, y: pos.y };
    this.endPos = endPos;
    this.pos = { x: pos.x, y: pos.y };
    this.speed = speed;
    this.dir = this.getDirection(pos, endPos);
  }

  run() {
    this.move();
    this.checkEdges();
    this.update();
  }

  move() {
    const dx = this.endPos.x - this.pos.x;
    const dy = this.endPos.y - this.pos.y;
    const angle = Math.atan2(dy, dx);
    const n = this.p.noise(
      this.pos.x * this.noiseZoom,
      this.pos.y * this.noiseZoom,
      this.p.frameCount * this.noiseSpeed
    );
    const angleNoise = n * this.p.TWO_PI * this.noiseMag;

    this.dir.x = this.p.cos(angle + angleNoise);
    this.dir.y = this.p.sin(angle + angleNoise);

    this.pos.x += this.dir.x * this.speed;
    this.pos.y += this.dir.y * this.speed;
  }

  checkEdges() {
    const d = this.p.dist(this.pos.x, this.pos.y, this.endPos.x, this.endPos.y);
    if (d < 10) {
      const temp = this.endPos;
      this.endPos = this.origPos;
      this.origPos = temp;
      this.pos = { x: this.origPos.x, y: this.origPos.y };
    }

    if (
      this.pos.x < 0 ||
      this.pos.x > this.p.width ||
      this.pos.y < 0 ||
      this.pos.y > this.p.height
    ) {
      this.pos = { x: this.origPos.x, y: this.origPos.y };
    }
  }

  update() {
    this.p.ellipse(this.pos.x, this.pos.y, 1, 1);
  }

  getDirection(from, to) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    return { x: this.p.cos(angle), y: this.p.sin(angle) };
  }
}
