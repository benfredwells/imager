// TODO: When I know how these should go into some sort of custom object
gvWidth = 50;
gvHeight = 50;
gvZoom = 5;
gvCurrentX = -1;
gvCurrentY = -1;
gvCanvas = null;
gvContext = null;
gvLoaderCanvas = null;
gvLoaderContext = null;
gvZoomRange = null;
gvCanvasDiv = null;
gvBottomInfo = null;
gvImage = null;
gvImageLoaded = false;
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
// Needed to run locally
gvRunningLocally = false

function canvasWidth() {
  return (gvWidth * gvZoom) + 2 * BORDER_WIDTH - GRID_WIDTH;
}

function canvasHeight() {
  return (gvHeight * gvZoom) + 2 * BORDER_WIDTH - GRID_WIDTH;
}

function drawBorder() {
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

function drawImage() {
  if (gvImageLoaded) {
    var imageData = gvLoaderContext.getImageData(0, 0, gvWidth, gvHeight);
    var index = 0;
    for (var y = 0; y < gvHeight; ++y) {
      for (var x = 0; x < gvWidth; ++x) {
        var r = imageData.data[index++];
        var g = imageData.data[index++];
        var b = imageData.data[index++];
        index++; // skip alpha
        var fillColor = 'rgb(' + r + ',' + g+ ',' + b + ')';
        gvContext.fillStyle = fillColor;
        gvContext.fillRect(gridLower(x), gridLower(y), gvZoom, gvZoom);
      }
    }
  } else {
    gvContext.fillStyle = BACKGROUND_COLOR;
    gvContext.fillRect(0, 0, canvasWidth(), canvasHeight());
  }
}

function updateCanvasSize() {
  gvCanvas.width = canvasWidth();
  gvCanvas.height = canvasHeight();
  drawImage();
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
               gvCanvasDiv.scrollLeft + document.body.scrollLeft;
  worldX = Math.floor(worldX / gvZoom);
  if (worldX < 0 || worldX >= gvWidth) {
    worldX = -1;
  }
  var worldY = event.clientY - gvCanvas.offsetTop - BORDER_WIDTH +
               gvCanvasDiv.scrollTop + document.body.scrollTop;
  worldY = Math.floor(worldY / gvZoom);
  if (worldY < 0 || worldY >= gvHeight) {
    worldY = -1;
  }
  highlightPixel(worldX, worldY, xPosEl, yPosEl);
}

function updateCanvasHolderSize() {
  /* This would be nicer but canvas sizing appears to be wrong,
   * which is why there is the mysterious 4 to get rid of scrollbars
  var maxWidth = window.innerWidth - (2 * gvCanvasDiv.offsetLeft);
  var maxHeight = window.innerHeight - gvCanvasDiv.offsetTop -
      gvBottomInfo.clientHeight - (2 * gvBottomInfo.offsetLeft);
  // Update width of holder div and add scroll bar if necessary
  var width = canvasWidth();
  var height = canvasHeight() + 4;
  if (width > maxWidth) {
    width = maxWidth;
  }
  if (height > maxHeight) {
    height = maxHeight;
  }
  gvCanvasDiv.style.setProperty('height', height + 'px');
  gvCanvasDiv.style.setProperty('width', width + 'px');
  */
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

function updateZoom(event) {
  gvZoom = gvZoomRange.value;
  updateCanvasSize();
  updateCanvasHolderSize();
}

function updateImage() {
  gvHeight = this.height;
  gvWidth = this.width;
  gvLoaderCanvas.width = gvWidth;
  gvLoaderCanvas.height = gvHeight;
  gvLoaderContext.drawImage(this, 0, 0);
  gvImageLoaded = true;
  updateCanvasSize();
  updateCanvasHolderSize();
}

function handleResize(event) {
  updateCanvasHolderSize();
}

function loadImage() {
  var imageSrc = '';
  if (!gvRunningLocally) {
    var files = this.files;
    if (files.length == 1) {
      imageSrc = window.URL.createObjectURL(files[0]);
    }
  } else {
    imageSrc = "test-image.jpeg";
  }
  var image = new Image();
  image.onload = updateImage;
  image.src = imageSrc;
}

function setupEvents() {
  gvCanvas.onmousemove = handleCanvasMouseMove;
  gvZoomRange.onchange = updateZoom;
  document.getElementById('filechooser').onchange = loadImage;
  window.onresize = handleResize;
}

function initView() {
  window.URL = window.URL || window.webkitURL;
  gvCanvas = document.getElementById('imagecanvas');
  gvZoomRange = document.getElementById('zoom');
  gvCanvasDiv = document.getElementById('canvasdiv');
  gvBottomInfo = document.getElementById('bottominfo')
  gvLoaderCanvas = document.getElementById('imageloadcanvas');
  if (gvZoomRange && gvCanvas && gvLoaderCanvas &&
      gvCanvasDiv && gvBottomInfo && gvCanvas.getContext && gvLoaderCanvas.getContext) {
    // TODO: use DOM level 2 events
    gvContext = gvCanvas.getContext('2d');
    gvLoaderContext = gvLoaderCanvas.getContext('2d');
    updateCanvasSize();
    updateCanvasHolderSize();
    setupEvents();
    //loadImage();
  } else {
    document.writeln("Your browser doesn't seem up to scratch, sorry");
  }
}

window.onload = initView;
