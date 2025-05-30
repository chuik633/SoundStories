function drawDynamicFont(p, type, values, inputText, font, x, y, maxWidth) {
  if (type == "wiggly") {
    drawWigglyFont(
      p,
      values,
      inputText,
      font,
      x,
      y,
      maxWidth,
      true,
      true,
      false
    );
  } else if (type == "strings") {
    drawStringsFont(p, values, inputText, font, x, y, maxWidth);
  } else if (type == "flow") {
    drawFlowFont(p, values, inputText, font, x, y, maxWidth);
  } else if (type == "blur") {
    drawBlurFont(p, values, inputText, font, x, y, maxWidth);
  } else if (type == "swirl") {
    drawFlow2Font(p, values, inputText, font, x, y, maxWidth);
  } else if (type == "annotated-strings") {
    drawAnnotatedStringsFont(p, values, inputText, font, x, y, maxWidth);
  }
}

function setupDynamicFont(p, type, values, inputText, font, x, y, maxWidth) {
  if (type == "wiggly") {
    return; //no set up needed
  } else if (type == "strings") {
    setupStringsFont(p, values, inputText, font, x, y, maxWidth);
  } else if (type == "flow") {
    setupFlowFont(p, values, inputText, font, x, y, maxWidth);
  } else if (type == "blur") {
    setupBlurFont(p, values, inputText, font, x, y, maxWidth);
  } else if (type == "swirl") {
    setupFlow2Font(p, values, inputText, font, x, y, maxWidth);
  } else if (type == "annotated-strings") {
    setupAnnotatedStringsFont(p, values, inputText, font, x, y, maxWidth);
  }
}
