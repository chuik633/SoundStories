let blurFontSegments = [];
let blurTextColor = "white";
let blurMaxPull = 1;
let blurStepSize = 4;
let blurNumBins = 12;

function setupBlurFont(p, values, inputText, font, x, y, maxWidth) {
  blurFontSegments = [];
  const fontSize = getResizedFontSize(inputText, maxFontSize, maxWidth);
  p.textFont(font);
  p.textSize(fontSize);

  const textWidth = inputText.length * fontSize;
  x -= textWidth / 3;

  p.background("white");
  p.fill("black");
  p.noStroke();
  p.text(inputText, x, y);
  p.loadPixels();

  processBlurScreen(p, blurStepSize, "black", 100);
}

function drawBlurFont(p, values, inputText, font, x, y, maxWidth) {
  const centerX = p.width / 2;
  const centerY = p.height / 2;
  p.angleMode(p.RADIANS);
  const maxR = p.dist(p.width / 2, p.height / 2, 0, 0);
  let bins = values.length;
  // bins = 8;
  const angleStep = (2 * Math.PI) / bins;

  for (let i = 0; i < bins; i++) {
    let binValue = values[i];
    const angle = i * angleStep;
    // console.log((angle / 2 / Math.PI) * 360);

    let r = p.map(
      Math.log(binValue + 0.1),
      Math.log(0.1),
      Math.log(1.1),
      10,
      maxR
    );
    // r = p.map(binValue, 0.2, 1, 1, maxR);
    // r = 1 + (maxR - 1) * (binValue * binValue);
    const dirX = Math.min(r * Math.cos(angle), p.width / 2);
    const dirY = Math.min(r * Math.sin(angle), p.height / 2);

    let textColor = d3.select("#films-page").style("--text-color");
    p.stroke(textColor);
    p.strokeWeight(0.8);
    p.line(
      p.width / 2,
      p.height / 2,
      centerX + r * Math.cos(angle),
      centerY + r * Math.sin(angle)
    );

    p.textSize(5);
    p.fill(textColor);
    p.noStroke();
    p.text(
      "angle: " + p.round((angle / 2 / Math.PI) * 360),
      centerX + 100 * Math.cos(angle) - 5,
      centerY + 100 * Math.sin(angle)
    );
    p.stroke(textColor);

    drawBlurLineSegments(p, maxR, dirX + centerX, dirY + centerY);
  }
}

function processBlurScreen(p, strokeLen, selectedColor, tolerance) {
  const pd = p.pixelDensity();
  for (let y = 0; y < p.height; y += blurStepSize) {
    for (let x = 0; x < p.width; x += blurStepSize) {
      const index = (x * pd + y * pd * p.width * pd) * 4;
      const r = p.pixels[index];
      const g = p.pixels[index + 1];
      const b = p.pixels[index + 2];

      if (colorDistance(p, selectedColor, p.color(r, g, b)) < tolerance) {
        blurFontSegments.push([x, y, x - strokeLen, y - strokeLen]);
      }
    }
  }
}

function drawBlurLineSegments(p, maxDistance, dirX, dirY) {
  p.strokeWeight(0.03);
  p.noFill();

  for (const [x1, y1, x2, y2] of blurFontSegments) {
    const d1 = p.dist(x1, y1, dirX, dirY);
    const d2 = p.dist(x2, y2, dirX, dirY);
    const midpointX = (x1 + x2) / 2;
    const midpointY = (y1 + y2) / 2;

    const pullFactor = p.constrain(
      p.map(Math.max(d1, d2), 0, maxDistance, blurMaxPull, 0),
      0,
      blurMaxPull
    );

    const pulledX = midpointX + (dirX - midpointX) * pullFactor;
    const pulledY = midpointY + (dirY - midpointY) * pullFactor;

    const nZoom = 0.005;
    const nSpeed = 0.01;
    const nSize = 10;

    const n =
      (p.noise(pulledX * nZoom, pulledY * nZoom, p.frameCount * nSpeed) * 2 -
        1) *
      nSize;

    drawCurvedLine(p, x1 + n, y1 + n, x2 + n, y2 + n, pulledX, pulledY);
  }
}

function drawCurvedLine(p, x1, y1, x2, y2, mx, my) {
  const cx1 = (x1 + mx) / 2;
  const cy1 = (y1 + my) / 2;
  const cx2 = (x2 + mx) / 2;
  const cy2 = (y2 + my) / 2;

  p.beginShape();
  p.vertex(x1, y1);
  p.bezierVertex(cx1, cy1, cx2, cy2, x2, y2);
  p.endShape();
}

function colorDistance(p, c1Hex, c2RGB) {
  const c1 = p.color(c1Hex);
  const r1 = p.red(c1),
    g1 = p.green(c1),
    b1 = p.blue(c1);
  const r2 = p.red(c2RGB),
    g2 = p.green(c2RGB),
    b2 = p.blue(c2RGB);
  return p.dist(r1, g1, b1, r2, g2, b2);
}
