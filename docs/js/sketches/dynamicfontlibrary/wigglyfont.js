function drawWigglyFont(
  p,
  values,
  inputText,
  font,
  x,
  y,
  maxWidth,
  animateNoise,
  animatePos,
  animateSize
) {
  //resize the font if its too big
  let fontSize = getResizedFontSize(inputText, maxFontSize, maxWidth);

  //format the sizing
  let textWidth = inputText.length * fontSize;
  x -= textWidth / 2; //shift it so its centered

  //divide the values up to the letters
  let sample_size = Math.round(values.length / inputText.length); //the size of the values to correspond to each letter

  //Draw each letter
  for (let letterIdx = 0; letterIdx < inputText.length; letterIdx++) {
    const letter = inputText[letterIdx];
    let value = 0;
    for (
      let i = sample_size * letterIdx;
      i < sample_size * (letterIdx + 1) && i < values.length;
      i++
    ) {
      value += values[i] / sample_size;
    }

    //Animate Size
    let size_shift = 1;
    if (animateSize) {
      size_shift = p.map(value, 0, 1, 1, 2);
    }
    let letter_fontSize = fontSize * size_shift;

    //Animate position
    let y_shift = 0;
    if (animatePos) {
      y_shift = p.map(value, 0, 1, 0, letter_fontSize / 4);
    }

    //Sample letter points
    sampleFac = p.map(letter_fontSize, 10, 100, 0.8, 0.3); //set font size accordingly
    let letter_points = font.textToPoints(
      letter,
      x,
      y - y_shift,
      letter_fontSize,
      { sampleFactor: sampleFac }
    );

    //Draw letter from points
    if (animateNoise) {
      drawLetterFromPoints(p, letter_points, value, fontSize);
    } else {
      drawLetterFromPoints(p, letter_points, value, 0);
    }

    //move position along
    x += letter_fontSize - letter_fontSize / 3;
  }
} //draw a single letter add params her
function drawLetterFromPoints(p, points, val, noiseSize) {
  // p.fill("white");
  p.noStroke();
  p.beginShape();
  for (const point of points) {
    // console.log(noiseSize);
    let n_zoom = p.map(noiseSize, 1, 100, 0.06, 0.021);
    // console.log("zoom", n_zoom);
    let n_speed =
      p.map(val, 0, 1, 0.001, 0.05) * p.map(noiseSize, 1, 100, 1, 1.5);
    let n =
      (p.noise(n_zoom * point.x, n_zoom * point.x, p.frameCount * n_speed) *
        noiseSize) /
      4;
    p.vertex(point.x + n, point.y + n);
  }
  p.endShape();
}
