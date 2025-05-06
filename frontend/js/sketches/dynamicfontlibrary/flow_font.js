let flowParticles = [];
const particleColor = "white";
const flowBackground = [0, 0, 0];
const xThreshold = 4;

function setupFlowFont(p, values, inputText, font, x, y, maxWidth) {
  flowParticles = [];

  const fontSize = getResizedFontSize(inputText, maxFontSize, maxWidth);
  sampleFac = p.map(fontSize, 10, 100, 0.8, 0.3);
  const textWidth = inputText.length * fontSize;
  let startX = x - textWidth / 2;

  for (const letter of inputText) {
    const letterPoints = font.textToPoints(letter, startX, y, fontSize, {
      sampleFactor: sampleFac,
    });

    for (const pt of letterPoints) {
      const endPos = { x: pt.x, y: pt.y - 200 };
      const speed = 1;
      flowParticles.push(new FlowParticle(p, pt, endPos, speed));
    }

    startX += fontSize;
  }
}

function drawFlowFont(p, values, inputText, font, x, y, maxWidth) {
  if (!flowParticles.length) return;

  p.noStroke();
  // p.fill(...flowBackground, 15);
  // p.rect(0, 0, p.width, p.height);

  const binsToUse = values.length;
  const particlesPerBin = Math.floor(flowParticles.length / binsToUse);

  for (let bin = 0; bin < binsToUse; bin++) {
    const value = values[bin];
    const mappedSpeed = p.map(value, 0, 1, 0.001, 2);
    const mappedZoom = p.map(value, 0, 1, 0.00001, 0.1);
    const mappedMag = p.map(value, 0, 1, 0.001, 0.5);

    for (
      let i = bin * particlesPerBin;
      i < (bin + 1) * particlesPerBin && i < flowParticles.length;
      i++
    ) {
      const particle = flowParticles[i];
      particle.noiseZoom = mappedZoom;
      particle.speed = mappedSpeed;
      particle.noiseMag = mappedMag;
      particle.run();
    }
  }
}
