const maxFontSize = 100;
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
  p.fill("white");
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
