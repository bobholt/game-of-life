// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function() {

  var canvas = document.getElementById('canvas');
  var windowWidth = null;
  var windowHeight = null;
  var ctx = canvas.getContext('2d');
  var cells = [];
  var cellsLength = 0;
  var cellSize = 1;

  window.onresize = init;

  init();

  function init() {
    sizeCanvas();
    clearCanvas();

    seed();
    tick();
    draw();
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, windowWidth, windowHeight);
  }

  function sizeCanvas() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    canvas.width = windowWidth;
    canvas.height = windowHeight;
  }

  function getX(i) {
    var calcX = i % windowWidth;
    return calcX - (calcX % cellSize);
  }

  function getY(i) {
    var calcY = (i - getX(i)) / windowWidth;
    return calcY - (calcY % cellSize);
  }

  function getIndex(x, y) {
    return x + y * windowWidth;
  }

  function seed() {
    for (var i = 0; i < windowWidth; i += cellSize) {
      for (var j = 0; j < windowHeight; j += cellSize) {
        if (Math.round(Math.random())) {
          cells[getIndex(i, j)] = true;
        }
      }
    }
    cellsLength = cells.length;
  }

  function tick() {
    setTimeout(tick, 500);

    var newCells = [];
    var nY, eX, sY, wX, xCoord, yCoord, neighbors, isAlive, liveNeighbors, deadNeighbors;

    //Loop through cells
    // Calculate NW, N, NE, E, SE, S, SW, W neighbors and if they are alive
    for (var i = 0; i < cellsLength; i++) {
      isAlive = cells[i];
      xCoord = getX(i);
      yCoord = getY(i);
      nY = yCoord - cellSize;
      eX = (xCoord + cellSize) % windowWidth;
      sY = (yCoord + cellSize) % windowHeight;
      wX = xCoord - cellSize;

      // If these roll around to negative 1, check the opposite side of the canvas
      nY = nY < 0 ? windowHeight + nY : nY;
      wX = wX < 0 ? windowWidth + wX : wX;

      neighbors = [
        getIndex(xCoord, nY), // N
        getIndex(eX, nY), // NE
        getIndex(eX, yCoord), // E
        getIndex(eX, sY), // SE
        getIndex(xCoord, sY), // S
        getIndex(wX, sY), // SW
        getIndex(wX, yCoord), // W
        getIndex(wX, nY)  // NW
      ];

      // reset neighbors counters
      liveNeighbors = 0;
      deadNeighbors = 0;

      for (var j = 0; j < 8; j++) {
        if (cells[neighbors[j]]) {
          liveNeighbors += 1;
        } else {
          deadNeighbors += 1;
        }

        if (deadNeighbors > 6 || liveNeighbors > 3) {
          break;
        }
      }

      if (isAlive) {
        // Any live cell with fewer than two live neighbours dies, as if caused by under-population.
        // Any live cell with more than three live neighbours dies, as if by overcrowding.
        // Any live cell with two or three live neighbours lives on to the next generation.
        newCells[i] = (liveNeighbors === 2 || liveNeighbors === 3)
      } else {
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        newCells[i] = (liveNeighbors === 3);
      }

    }

    cells = newCells;
  }

  function draw() {
    requestAnimFrame(draw);

    clearCanvas();
    for (var i = 0; i < cellsLength; i++) {
      if (cells[i]) {
        ctx.fillRect(getX(i), getY(i), cellSize, cellSize);
      }
    }
  }

}());
