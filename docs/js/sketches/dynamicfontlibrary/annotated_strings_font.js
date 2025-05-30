console.log("ANNOTATED");
let lines = [];
let stringsPoints = [];
let x_threshold = 4;
let radius = 120;
let showAnnotations = true;
let splitText = false;

function setupAnnotatedStringsFont(p, values, inputText, font, x, y, maxWidth) {
  if (Array.isArray(inputText)) {
    splitText = true;
    lines = [];
    stringsPoints = [];
    let fontSize = maxFontSize;
    for (let word of inputText) {
      const lineFontSize = getResizedFontSize(word, maxFontSize, maxWidth);
      if (lineFontSize < maxFontSize) {
        fontSize = lineFontSize;
      }
    }
    sampleFac = p.map(fontSize, 10, 100, 0.8, 0.3);
    radius = 120;

    let textY = y - (inputText.length * fontSize) / 3 + 80;
    for (const word of inputText) {
      const textWidth = word.length * fontSize;
      let startX = x - textWidth / 2;
      for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        const letter_points = font.textToPoints(
          letter,
          startX,
          textY,
          fontSize,
          {
            sampleFactor: sampleFac,
          }
        );

        if (showAnnotations) {
          stringsPoints = [...stringsPoints, ...letter_points];
        }
        //make the lines by x boundary stuff and then save them
        let letterLines = get_shape_lines(letter_points);
        lines = [...lines, ...letterLines];

        startX += fontSize;
      }
      textY += fontSize + 10;
    }
  } else {
    const fontSize = getResizedFontSize(inputText, maxFontSize, maxWidth);
    sampleFac = p.map(fontSize, 10, 100, 0.8, 0.3);
    radius = 120;

    const textWidth = inputText.length * fontSize;
    let startX = x - textWidth / 2;

    //reset it cuz maybe new text
    lines = [];
    stringsPoints = [];

    for (let i = 0; i < inputText.length; i++) {
      const letter = inputText[i];
      const letter_points = font.textToPoints(letter, startX, y, fontSize, {
        sampleFactor: sampleFac,
      });

      if (showAnnotations) {
        stringsPoints = [...stringsPoints, ...letter_points];
      }
      //make the lines by x boundary stuff and then save them
      let letterLines = get_shape_lines(letter_points);
      lines = [...lines, ...letterLines];

      startX += fontSize;
    }
  }
}

let delta = 1;
//draw strings based on the values
function drawAnnotatedStringsFont(p, values, inputText, font, x, y, maxWidth) {
  if (lines == []) return;
  if (showAnnotations) {
    p.noStroke();
    p.background("white");
    p.fill("black");
    drawGrid(p, 20, 20, "grey", 0, 0, p.width, p.height);
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

  if (showAnnotations) {
    p.noStroke();
    const lines_per_bin = Math.floor(lines.length / values.length);
    p.textSize(6);
    // p.clear();
    p.fill("black");

    let distToEdgeX = p.min(p.mouseX, p.width - p.mouseX);
    let distToEdgeY = p.min(p.mouseY, p.height - p.mouseY);
    let distToEdge = p.min(distToEdgeX, distToEdgeY);

    let maxDist = p.min(p.width, p.height) / 2;

    radius = p.map(distToEdge, 0, maxDist, 0, 200);

    // radius = p.map(disttodraw, 0, maxdist, 200, 0);
    if (p.mouseIsPressed) {
      radius += delta;
      if (radius > 300) {
        delta = -1;
      }
      if (radius < 120) {
        delta = 1;
      }
    }

    p.ellipse(p.mouseX, p.mouseY, radius, radius);

    drawGrid(p, 20, 20, "white", 0, 0, p.width, p.height);
    p.textFont("Courier New");
    p.fill("white");
    p.text(`bin_size ${lines_per_bin}`, x - 20, y + 40);
    p.text(`x_threshold ${x_threshold}`, x - 20, y + 50);
    p.fill("white");

    for (let point of stringsPoints) {
      if (p.dist(point.x, point.y, p.mouseX, p.mouseY) < radius) {
        p.ellipse(point.x, point.y, 1, 1);
      }
    }
    for (let binNum = 0; binNum < values.length; binNum++) {
      let value = values[binNum];
      let pull = p.map(value, 0, 1, -x_threshold, x_threshold * 4);
      for (
        let i = binNum * lines_per_bin;
        i < (binNum + 1) * lines_per_bin;
        i++
      ) {
        let [x1, y1, x2, y2] = lines[i];
        p.textSize(4);
        let maxh = 20;
        let h = p.map(value, 0, 1, 0, maxh);

        if (i % 2 == 0) {
          p.text(`${p.round(value, 3)}`, x1 - 5, y1 + 5);
          p.noFill();
          p.strokeWeight(0.2);
          p.stroke("white");
          p.rect(x1 - 5, y1 + 5, 2, maxh);

          p.fill("white");
          p.rect(x1 - 5, y1 + 5, 2, h);
        } else {
          p.text(`${p.round(value, 3)}`, x2 - 5, y2 - 5);
          p.noFill();
          p.strokeWeight(0.2);
          p.stroke("white");
          p.rect(x2 - 5, y2 - 5 - maxh, 2, maxh);

          p.fill("white");
          p.rect(x2 - 5, y2 - 5 - h, 2, h);
        }

        p.stroke("white");
        p.strokeWeight(0.1);
        p.line(x1, y1, x2, y2);
        if (value > 0) {
          p.noStroke();
          if (Math.abs(x1 - p.mouseX) < x_threshold) {
            if (Math.abs((y1 + y2) / 2 - p.mouseY) < radius) {
              drawCurvedLine(p, x1, y1, x2, y2, x1 + pull, (y1 + y2) / 2);
            }

            p.fill("black");
            p.stroke("white");
            p.strokeWeight(0.5);
            p.rect(p.mouseX - 50, y - 150, 180, 40);
            p.noStroke();
            p.fill("white");
            p.textSize(8);
            p.text("larger values => bigger pull", p.mouseX - 30, y - 138);
            p.textSize(6);
            p.text(`frequency bin: ${binNum + 1}`, p.mouseX - 30, y - 130);

            p.textSize(6);
            p.text(`value: ${p.round(value, 4)}`, p.mouseX - 30, y - 122);
          }
        }
      }
    }
  } else {
    p.noStroke();
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
