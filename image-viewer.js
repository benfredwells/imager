// When I know how these should go into some sort of custom object
gvWidth = 50;
gvHeight = 50;
gvZoom = 10;
gvCurrentX = -1;
gvCurrentY = -1;
// How to get these from CSS?
BACKGROUND_COLOR = 'rgb(255,255,255)';
BORDER_COLOR = 'rgb(128,128,128)';
GRID_COLOR = 'rgb(208,208,208)';
HIGHLIGHT_COLOR = 'rgb(0,128,255)';
// General constants
MIN_ZOOM_FOR_GRID = 4;
BORDER_WIDTH = 2;
GRID_WIDTH = 1;
HALF_BORDER = BORDER_WIDTH / 2;
HALF_GRID = GRID_WIDTH / 2;

function canvasWidth() {
  return (gvWidth * gvZoom) + 2 * BORDER_WIDTH - GRID_WIDTH;
}

function canvasHeight() {
  return (gvHeight * gvZoom) + 2 * BORDER_WIDTH - GRID_WIDTH;
}

function sizeCanvas(canvas) {
  canvas.width = canvasWidth();
  canvas.height = canvasHeight();
}

function drawBorder(context) {
  // temp while we don't actually have an image
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, canvasWidth(), canvasHeight());
  //
  drawRect(context, BORDER_WIDTH, BORDER_COLOR, HALF_BORDER, HALF_BORDER,
      canvasWidth() - BORDER_WIDTH, canvasHeight() - BORDER_WIDTH);
}

function gridCoord(pc, edgeType) {
  var lower = pc * gvZoom + BORDER_WIDTH - GRID_WIDTH;
  return lower + edgeType * GRID_WIDTH;
}

EDGE_LOWER = 0;
EDGE_CENTER = 0.5;
EDGE_UPPER = 1;

function gridLower(pc) { return gridCoord(pc, EDGE_LOWER); }
function gridCenter(pc) { return gridCoord(pc, EDGE_CENTER); }
function gridUpper(pc) { return gridCoord(pc, EDGE_UPPER); }

function drawGrid(context) {
  // Don't draw the grid if it would obscure the drawing
  if (gvZoom <= MIN_ZOOM_FOR_GRID) return;
  // Don't draw first horizontal or vertical gridline as it is already
  // done by the border.
  for (var x = 1; x < gvWidth; ++x) {
    drawVerticalLine(context, GRID_WIDTH, GRID_COLOR, gridCenter(x),
        gridUpper(0), gridLower(gvHeight));
  }
  for (var y = 1; y < gvHeight; ++y) {
    drawHorizontalLine(context, GRID_WIDTH, GRID_COLOR, gridUpper(0),
        gridLower(gvWidth), gridCenter(y));
  }
}

function highlightGrid(context, px, py, color) {
  var doDrawLeft = px > 0;
  var doDrawRight = px < gvWidth - 1;
  var doDrawTop = py > 0;
  var doDrawBottom = py < gvHeight - 1;

  var edgeTop = gridLower(py);
  if (!doDrawTop) edgeTop = gridUpper(py);
  var edgeBottom = gridUpper(py + 1);
  if (!doDrawBottom) edgeBottom = gridLower(py + 1);

  if (doDrawLeft) {
    drawVerticalLine(context, GRID_WIDTH, color, gridCenter(px),
        edgeTop, edgeBottom);
  }
  if (doDrawRight) {
    drawVerticalLine(context, GRID_WIDTH, color, gridCenter(px + 1),
        edgeTop, edgeBottom);
  }
  if (doDrawTop) {
    drawHorizontalLine(context, GRID_WIDTH, color, gridUpper(px),
        gridLower(px + 1), gridCenter(py));
  }
  if (doDrawBottom) {
    drawHorizontalLine(context, GRID_WIDTH, color, gridUpper(px),
        gridLower(px + 1), gridCenter(py + 1));
  }
}

function highlightPixel(context, px, py, xPosEl, yPosEl) {
  if (px == -1 || py == -1) return;
  if (px == gvCurrentX && py == gvCurrentY) return;
  if (gvCurrentX != -1 && gvCurrentY != -1) {
    highlightGrid(context, gvCurrentX, gvCurrentY, GRID_COLOR);
  }
  gvCurrentX = px;
  gvCurrentY = py;
  highlightGrid(context, gvCurrentX, gvCurrentY, HIGHLIGHT_COLOR);
  xPosEl.innerHTML = gvCurrentX;
  yPosEl.innerHTML = gvCurrentY;
}

// Turn this into a closure so no need to keep getting elements.
function handleCanvasMouseMove(event) {
  var canvas = document.getElementById('imagecanvas');
  var xPosEl = document.getElementById('xpos');
  var yPosEl = document.getElementById('ypos');
  // Does not work in firefox when window is scrolled :(
  // Should use a point object and put this calc into a function.
  var worldX = event.clientX - canvas.offsetLeft - BORDER_WIDTH +
               document.body.scrollLeft;
  worldX = Math.floor(worldX / gvZoom);
  if (worldX < 0 || worldX >= gvWidth) {
    worldX = -1;
  }
  var worldY = event.clientY - canvas.offsetTop - BORDER_WIDTH +
               document.body.scrollTop;
  worldY = Math.floor(worldY / gvZoom);
  if (worldY < 0 || worldY >= gvHeight) {
    worldY = -1;
  }
  highlightPixel(canvas.getContext('2d'), worldX, worldY, xPosEl, yPosEl);
}

function initView() {
  var canvas = document.getElementById('imagecanvas');
  if (canvas && canvas.getContext) {
    canvas.onmousemove = handleCanvasMouseMove;
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
