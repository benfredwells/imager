function drawLine(context, lineWidth, lineStyle, x1, y1, x2, y2) {
  context.lineWidth = lineWidth;
  context.strokeStyle = lineStyle;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function drawHorizontalLine(context, lineWidth, lineStyle, x1, x2, y) {
  drawLine(context, lineWidth, lineStyle, x1, y, x2, y);
}

function drawVerticalLine(context, lineWidth, lineStyle, x, y1, y2) {
  drawLine(context, lineWidth, lineStyle, x, y1, x, y2);
}

function drawRect(context, lineWidth, lineStyle, x1, y1, w, h) {
  context.lineWidth = lineWidth;
  context.strokeStyle = lineStyle;
  context.strokeRect(x1, y1, w, h);
}
