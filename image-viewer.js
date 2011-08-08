// TODO: When I know how these should go into some sort of custom object
gvWidth = 50;
gvHeight = 50;
gvZoom = 10;
gvCurrentX = -1;
gvCurrentY = -1;
gvCanvas = null;
gvContext = null;
gvWidthRange = null;
gvHeightRange = null;
gvCanvasDiv = null;
gvBottomInfo = null;
// TODO: get these from CSS
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

function drawBorder() {
  // TODO: remove this when we have a proper image
  gvContext.fillStyle = BACKGROUND_COLOR;
  gvContext.fillRect(0, 0, canvasWidth(), canvasHeight());
  //
  drawRect(gvContext, BORDER_WIDTH, BORDER_COLOR, HALF_BORDER, HALF_BORDER,
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

function drawGrid() {
  // Don't draw the grid if it would obscure the drawing
  if (gvZoom <= MIN_ZOOM_FOR_GRID) return;
  // Don't draw first horizontal or vertical gridline as it is already
  // done by the border.
  for (var x = 1; x < gvWidth; ++x) {
    drawVerticalLine(gvContext, GRID_WIDTH, GRID_COLOR, gridCenter(x),
        gridUpper(0), gridLower(gvHeight));
  }
  for (var y = 1; y < gvHeight; ++y) {
    drawHorizontalLine(gvContext, GRID_WIDTH, GRID_COLOR, gridUpper(0),
        gridLower(gvWidth), gridCenter(y));
  }
}

function updateCanvasSize() {
  gvCanvas.width = canvasWidth();
  gvCanvas.height = canvasHeight();
  drawBorder();
  drawGrid();
}

function highlightGrid(px, py, color) {
  var doDrawLeft = px > 0;
  var doDrawRight = px < gvWidth - 1;
  var doDrawTop = py > 0;
  var doDrawBottom = py < gvHeight - 1;

  var edgeTop = gridLower(py);
  if (!doDrawTop) edgeTop = gridUpper(py);
  var edgeBottom = gridUpper(py + 1);
  if (!doDrawBottom) edgeBottom = gridLower(py + 1);

  if (doDrawLeft) {
    drawVerticalLine(gvContext, GRID_WIDTH, color, gridCenter(px),
        edgeTop, edgeBottom);
  }
  if (doDrawRight) {
    drawVerticalLine(gvContext, GRID_WIDTH, color, gridCenter(px + 1),
        edgeTop, edgeBottom);
  }
  if (doDrawTop) {
    drawHorizontalLine(gvContext, GRID_WIDTH, color, gridUpper(px),
        gridLower(px + 1), gridCenter(py));
  }
  if (doDrawBottom) {
    drawHorizontalLine(gvContext, GRID_WIDTH, color, gridUpper(px),
        gridLower(px + 1), gridCenter(py + 1));
  }
}

function highlightPixel(px, py, xPosEl, yPosEl) {
  if (px == -1 || py == -1) return;
  if (px == gvCurrentX && py == gvCurrentY) return;
  if (gvCurrentX != -1 && gvCurrentY != -1) {
    highlightGrid(gvCurrentX, gvCurrentY, GRID_COLOR);
  }
  gvCurrentX = px;
  gvCurrentY = py;
  highlightGrid(gvCurrentX, gvCurrentY, HIGHLIGHT_COLOR);
  xPosEl.innerHTML = gvCurrentX;
  yPosEl.innerHTML = gvCurrentY;
}

// TODO: Turn this into a closure so no need to keep getting elements.
function handleCanvasMouseMove(event) {
  var xPosEl = document.getElementById('xpos');
  var yPosEl = document.getElementById('ypos');
  // Does not work in firefox when window is scrolled :(
  // TODO: Should use a point object and put this calc into a function.
  var worldX = event.clientX - gvCanvas.offsetLeft - BORDER_WIDTH +
               document.body.scrollLeft;
  worldX = Math.floor(worldX / gvZoom);
  if (worldX < 0 || worldX >= gvWidth) {
    worldX = -1;
  }
  var worldY = event.clientY - gvCanvas.offsetTop - BORDER_WIDTH +
               document.body.scrollTop;
  worldY = Math.floor(worldY / gvZoom);
  if (worldY < 0 || worldY >= gvHeight) {
    worldY = -1;
  }
  highlightPixel(worldX, worldY, xPosEl, yPosEl);
}

function updateCanvasHolderSize() {
  //TODO: Refactor this horrible code!
  // Calculate max width and height. Assumes gap above and below gvBottomInfo
  // is equal to its left offset.
  var maxWidth = window.innerWidth - (2 * gvCanvasDiv.offsetLeft);
  var maxHeight = window.innerHeight - gvCanvasDiv.offsetTop -
      gvBottomInfo.clientHeight - (2 * gvBottomInfo.offsetLeft);
  // Update width of holder div and add scroll bar if necessary
  var width = canvasWidth();
  var scrollX = false;
  if (width > maxWidth) {
    width = maxWidth;
    scrollX = true;
  }
  gvCanvasDiv.style.setProperty('width', width + 'px');
  gvCanvasDiv.style.setProperty('overflow-x', scrollX ? 'scroll' : 'hidden');
  // Now update height and add scroll bar if necessary
  var height = canvasHeight();
  var scrollY = false;
  if (height > maxHeight) {
    height = maxHeight;
    scrollY = true;
  }
  gvCanvasDiv.style.setProperty('height', height + 'px');
  gvCanvasDiv.style.setProperty('overflow-y', scrollY ? 'scroll' : 'hidden');
  // Update height for horizontal scroll bar
  if (!scrollY && gvCanvasDiv.clientHeight < gvCanvasDiv.scrollHeight) {
    height += gvCanvas.scrollHeight - gvCanvasDiv.clientHeight;
    if (height > maxHeight) {
      height = maxHeight;
      scrollY = true;
    }
    gvCanvasDiv.style.setProperty('height', height + 'px');
    gvCanvasDiv.style.setProperty('overflow-y', scrollY ? 'scroll' : 'hidden');
  }
  // Update width for vertical scroll bar
  if (!scrollX && gvCanvasDiv.clientWidth < gvCanvasDiv.scrollWidth) {
    width += gvCanvas.scrollWidth - gvCanvasDiv.clientWidth;
    if (width > maxWidth) {
      width = maxWidth;
      scrollX = true;
    }
    gvCanvasDiv.style.setProperty('width', width + 'px');
    gvCanvasDiv.style.setProperty('overflow-x', scrollX ? 'scroll' : 'hidden');
  }
}

function updateImageSize(event) {
  gvHeight = gvHeightRange.value;
  gvWidth = gvWidthRange.value;
  updateCanvasSize();
  updateCanvasHolderSize();
}

function handleResize(event) {
  updateCanvasHolderSize();
}

function setupEvents() {
  gvCanvas.onmousemove = handleCanvasMouseMove;
  gvWidthRange.onchange = updateImageSize;
  gvHeightRange.onchange = updateImageSize;
  window.onresize = handleResize;
}

function initView() {
  gvCanvas = document.getElementById('imagecanvas');
  gvWidthRange = document.getElementById('width');
  gvHeightRange = document.getElementById('height');
  gvCanvasDiv = document.getElementById('canvasdiv');
  gvBottomInfo = document.getElementById('bottominfo')
  if (gvHeightRange && gvWidthRange && gvCanvas && gvCanvasDiv && gvBottomInfo &&
      gvCanvas.getContext) {
    // TODO: use DOM level 2 events
    gvContext = gvCanvas.getContext('2d');
    updateCanvasSize();
    updateCanvasHolderSize();
    setupEvents();
  } else {
    document.writeln("Your browser doesn't seem up to scratch, sorry");
  }
}

window.onload = initView;
