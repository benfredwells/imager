// When I know how these should go into some sort of custom object
gvWidth = 50;
gvHeight = 20;
gvZoom = 10;
// How to get these from CSS?
BACKGROUND_COLOR = 'rgb(255,255,255)';
BORDER_COLOR = 'rgb(128,128,128)';
GRID_COLOR = 'rgb(192,192,192)';
// General constants
MIN_ZOOM_FOR_GRID = 4;
BORDER_WIDTH = 2;
GRID_WIDTH = 1;

function vpWidth() {
  return (gvWidth * gvZoom) + 1;
}

function vpHeight() {
  return (gvHeight * gvZoom);
}

function sizeCanvas(canvas) {
  canvas.width = vpWidth();
  canvas.height = vpHeight();
}

function drawBorder(context) {
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, vpWidth(), vpHeight());
  context.lineWidth = 1;
  context.strokeStyle = BORDER_COLOR;
  context.strokeRect(0.5, 0.5, vpWidth() - 1, vpHeight() - 1);
}

function drawGrid(context) {
  // Don't draw the grid if it would obscure the drawing
  if (gvZoom <= MIN_ZOOM_FOR_GRID) return;
  // don't draw first horizontal or vertical gridline as it is already
  // done by the border.
  context.lineWidth = 1;
  context.strokeStyle = GRID_COLOR;
  for (var x = 1; x < gvWidth; ++x) {
    context.beginPath();
    context.moveTo(x * gvZoom + 0.5, 1);
    context.lineTo(x * gvZoom + 0.5, vpHeight() - 1);
    context.stroke();
  }
  for (var y = 1; y < gvHeight; ++y) {
    context.beginPath();
    context.moveTo(1, y * gvZoom + 0.5);
    context.lineTo(vpWidth() - 1, y * gvZoom + 0.5);
    context.stroke();
  }
}

function initView() {
  var canvas = document.getElementById('imagecanvas');
  if (canvas && canvas.getContext) {
    var context = canvas.getContext('2d');
    context.globalAlpha = 1.0;
    sizeCanvas(canvas);
    drawBorder(context);
    drawGrid(context);
  } else {
    document.writeln("Your browser doesn't seem up to scratch, sorry");
  }
}

window.onload = initView;
