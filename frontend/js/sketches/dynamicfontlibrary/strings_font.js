let lines = [];
let x_threshold = 4;
function setupStringsFont(p, values, inputText, font, x, y, maxWidth) {
  const fontSize = getResizedFontSize(inputText, maxFontSize, maxWidth);
  sampleFac = p.map(fontSize, 10, 100, 0.8, 0.3);

  const textWidth = inputText.length * fontSize;
  let startX = x - textWidth / 2;

  //reset it cuz maybe new text
  lines = [];

  for (let i = 0; i < inputText.length; i++) {
    const letter = inputText[i];
    const letter_points = font.textToPoints(letter, startX, y, fontSize, {
      sampleFactor: sampleFac,
    });

    //make the lines by x boundary stuff and then save them
    let letterLines = get_shape_lines(letter_points);
    lines = [...lines, ...letterLines];

    startX += fontSize;
  }
}

//draw strings based on the values
function drawStringsFont(p, values, inputText, font, x, y, maxWidth) {
  if (lines == []) return;

  p.noStroke();
  p.fill("white");
  const lines_per_bin = Math.floor(lines.length / values.length);
  for (let binNum = 0; binNum < values.length; binNum++) {
    let value = values[binNum];
    let pull = p.map(value, 0, 1, -x_threshold, x_threshold * 4);
    for (
      let i = binNum * lines_per_bin;
      i < (binNum + 1) * lines_per_bin;
      i++
    ) {
      let [x1, y1, x2, y2] = lines[i];
      p.stroke("white");
      p.strokeWeight(0.1);
      p.line(x1, y1, x2, y2);
      if (value > 0) {
        p.noStroke();
        drawCurvedLine(p, x1, y1, x2, y2, x1 + pull, (y1 + y2) / 2);
      }
    }
  }
}

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
