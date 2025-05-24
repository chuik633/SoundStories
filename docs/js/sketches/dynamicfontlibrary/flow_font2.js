let flow2Particles = [];
let flow2Threshold = 1;
const flow2Color = "white";
const flow2Bg = [0, 0, 0];

function setupFlow2Font(p, values, inputText, font, x, y, maxWidth) {
  flow2Particles = [];

  const fontSize = getResizedFontSize(inputText, maxFontSize, maxWidth);
  sampleFac = p.map(fontSize, 10, 100, 0.8, 0.3);

  const textWidth = inputText.length * fontSize;
  let startX = x - textWidth / 2;

  for (const letter of inputText) {
    const letterPoints = font.textToPoints(letter, startX, y, fontSize, {
      sampleFactor: sampleFac,
    });
    const letterLines = get_shape_lines_2(letterPoints, flow2Threshold);

    for (let [x1, y1, x2, y2] of letterLines) {
      const startPos = { x: x1, y: y1 };
      const endPos = { x: x2, y: y2 };
      flow2Particles.push(new FlowParticle(p, startPos, endPos, 1));
      flow2Particles.push(new FlowParticle(p, endPos, startPos, 1));
    }

    startX += fontSize;
  }
}

function drawFlow2Font(p, values, inputText, font, x, y, maxWidth) {
  p.noStroke();
  // p.fill(...flow2Bg, 10);
  // p.rect(0, 0, p.width, p.height);

  const binsToUse = values.length;
  const particlesPerBin = Math.floor(flow2Particles.length / binsToUse);

  for (let bin = 0; bin < binsToUse; bin++) {
    const value = values[bin];
    const mappedSpeed = p.map(value, 0, 1, 0.001, 5);
    const mappedZoom = p.map(value, 0, 1, 0.00001, 0.1);
    const mappedMag = p.map(value, 0, 1, 0.001, 0.5);

    for (
      let i = bin * particlesPerBin;
      i < (bin + 1) * particlesPerBin && i < flow2Particles.length;
      i++
    ) {
      const particle = flow2Particles[i];
      particle.noiseZoom = mappedZoom;
      particle.speed = mappedSpeed;
      particle.noiseMag = mappedMag;
      particle.run();
    }
  }
}

function get_shape_lines_2(points) {
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
