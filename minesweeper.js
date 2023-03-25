class Tile {
    // Public instance fields
    row;
    col;
    size;
    x;
    y;
    numAdjMines = 0;
    mine = false;
    flag = false;
    isFaceUp = false;
    hover = false;

    constructor(row, col, size) {
        this.row = row;
        this.col = col;
        this.updateSize(size);
    }

    // Called at instantiation or if window is resized
    updateSize(size) {
        this.size = size;
        this.x = this.col * this.size;
        this.y = this.row * this.size;
    }

    draw() {
        let face;
        canvasDraw.drawBox(this);

        if(this.isFaceUp) {
            if(this.mine) face = 'mine';
            else if(this.numAdjMines) canvasDraw.drawNum(this);
        } else if(this.flag) face = 'flag';

        if(face) canvasDraw.drawFace(this, face);
    }
}

class Gameboard {

    // Public instance fields
    numRows;
    numCols;
    tileSize;
    numMines;

    // Private instance fields
    #tiles;

    constructor(level) {
        this.#setBoardSize(level);
        this.#setTileSize();
        canvasDraw.buildCanvas(this.numRows, this.numCols, this.tileSize);
        this.#generateTiles();

        // Detects window resize, calculates new (margined) tile size, redraws canvas, redraws tiles
        window.addEventListener('resize', () => {
            this.#setTileSize();
            canvasDraw.buildCanvas(this.numRows, this.numCols, this.tileSize);
            this.#resizeTiles(this.tileSize);
        });
    }

    getTile(row, col) {
        return this.#tiles[row][col];
    }

    getAdjTiles(tile) {
        let adj = [];
        for (let i = tile.row - 1; i <= tile.row + 1; i++) {
            for (let j = tile.col - 1; j <= tile.col + 1; j++) {
                let validRow = i >= 0 && i < this.numRows;
                let validCol = j >= 0 && j < this.numCols;
                let thisTile = i === tile.row && j === tile.col;
                if (validRow && validCol && !thisTile)
                    adj.push(this.#tiles[i][j]);
            }
        }
        return adj;
    }

    placeMines(target) {
        for (var k = 0; k < this.numMines; k++) {
            let mineRow;
            let mineCol;
            let alreadyMine;
            let tooClose;
            
            // Mine index must pass two conditions
            // 1. Mine index isn't already a mine
            // 2. Mine cannot be planted within one tile of where user clicked
            // Generate mine index until valid
           do {
                mineRow = Math.floor(Math.random() * this.numRows);
                mineCol = Math.floor(Math.random() * this.numCols);
                alreadyMine = this.#tiles[mineRow][mineCol].mine;
                tooClose = mineRow >= target.row - 1 && mineRow <= target.row + 1 && mineCol >= target.col - 1 && mineCol <= target.col + 1;
            } while (alreadyMine || tooClose);
            let mineTile = this.#tiles[mineRow][mineCol];
            
            // Once conditions of do-while are passed, assign the index generated as a mine
            mineTile.mine = true;
            
            // Gather indices of all tiles adjacent to mine
            let adjMines = this.getAdjTiles(mineTile);
            
            // Increment adjacent mine count of all tiles adjacent to mine
            for (let adj of adjMines) {
                adj.numAdjMines++;
            }
        }
    }

    checkWin() {
        // Returns false if any non-mine tiles are still face down
        for(let row of this.#tiles) {
            for(let tile of row) {
                if(!tile.isFaceUp && !tile.mine) {
                    return false;
                }
            }
        }
        return true;
    }

    loseGame() {
        // Turn all mine tiles face up
        // Assign all mine tiles to be passed to mine draw function
        for(let row of this.#tiles) {
            for(let tile of row) {
                if(tile.mine) {
                    tile.isFaceUp = true;
                    tile.draw();
                }
            }
        }
    }

    #setBoardSize(level) {
        switch(level) {
            case 'easy':
                this.numRows = 9;
                this.numCols = 9;
                this.numMines = 10;
                break;
            case 'medium':
                this.numRows = 16;
                this.numCols = 16;
                this.numMines = 40;
                break;
            case 'hard':
                this.numRows = 22;
                this.numCols = 22;
                this.numMines = 99;
                break;
        }
    }

    // Tiles + margins sized such that gameboard will always occupy at maximum 60% of screen height
    #setTileSize() {
        this.tileSize = Math.floor(0.6 * window.innerHeight / this.numRows);
    }

    // Triggered when window resize event is detected and after new tile size is calculated and canvas resized
    // Updates each tile with new size and xy-coords, redraws on new canvas
    #resizeTiles(newSize) {
        this.tileSize = newSize;
        for(let row of this.#tiles) {
            for(let tile of row) {
                tile.updateSize(this.tileSize);
                tile.draw(tile);
            }
        }
    }

    #generateTiles() {
        // Creates array of all tiles based on Tile constructor
        // Tiles are all face down and have no value until assigned at first click
        this.#tiles = [];
        for(let row = 0; row < this.numRows; row++) {
            this.#tiles[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                let tile = new Tile(row, col, this.tileSize);
                this.#tiles[row][col] = tile;
                tile.draw();
            }
        }
    }
}

const game = (function() {

    // Private variables
    let start;
    let gameOver;
    let flagCount;
    let timeElapsed;
    let timeInterval;
    let hoverTile;
    let flagDisplay = document.getElementById('flag-count');
    let timeDisplay = document.getElementById('time-elapsed');
    const reset = document.getElementById('reset-btn');
    const levelRadios = document.querySelectorAll('input[name="level"]');

    reset.addEventListener('click', resetGame);
    levelRadios.forEach(radio => {
        radio.addEventListener('change', resetGame);
    });

    // Public methods
    return {
        resetGame,
        mouseEvent
    }

    function resetGame() {
        gameOver = false;
        start = false;

        // Instantiates new instance of Gameboard based on level
        let level = document.querySelector('input[name="level"]:checked').value;
        board = new Gameboard(level);

        flagCount = board.numMines;
        timeElapsed = 0;
        flagDisplay.innerText = flagCount;
        timeDisplay.innerText = timeElapsed;
        hoverTile = null;
        clearInterval(timeInterval);
    }

    // Accepts any mouse event, determines which tile was targeted and passes it to private handling functions
    function mouseEvent(event) {
        if(!gameOver) {
            let row = Math.floor(event.offsetY / board.tileSize);
            let col = Math.floor(event.offsetX / board.tileSize);

            // Restrict target tile coordinates to those valid on the gameboard (coordinates may be outside gameboard for mouseout event)
            row = Math.max(row, 0);
            row = Math.min(row, board.numRows - 1);
            col = Math.max(col, 0);
            col = Math.min(col, board.numCols - 1);

            let target = board.getTile(row, col);

            switch(event.type) {
                case 'mouseout':
                    _unhover();
                    break;
                case 'mousemove':
                    _unhover();
                    if(!gameOver && !target.isFaceUp) _hover(target);
                    break;
                case 'mouseup':
                    if(!gameOver && !target.isFaceUp) event.button === 0 ? _leftClick(target) : _rightClick(target);
                    break;
            }
        }
    }

    // Turns off hover for last tile stored at last mousemove event, redraws
    function _unhover() {
        if(hoverTile) {
            hoverTile.hover = false;
            hoverTile.draw();
        }
    }

    // Turns on hover for tile targeted in mousemove event, redraws with shovel image
    // Stores hovered tile so it can be turned off at next mousemove event
    function _hover(target) {
        hoverTile = target;
        hoverTile.hover = true;
        canvasDraw.drawBox(target);
        canvasDraw.drawFace(target, 'dig');
    }

    function _leftClick(target) {
        let flipTiles = [target]; // Array to contain all tile indices to be flipped
        
        // First click will assign tiles to set the field
        if(start === false) {
            start = true; // Toggle so game won't reset on any future clicks
            board.placeMines(target); // Passes first clicked tile
            timeInterval = setInterval(_advanceTimer, 1000);
        } 
        
        if(target.mine) {
            gameOver = true;
            clearInterval(timeInterval);
            board.loseGame();
            return;
        }
    
        // If tile clicked is zero, will need to flip all adjacent tiles too
        // Flood fill tiles to flip by breadth-first search, checking adjacent tiles for zeros
        if(target.numAdjMines === 0) {
            let zeros = [target]; // Queue of zeros tiles to check their adjacent tiles for zeros
    
            // Check every tile adjacent to every zero in array
            while(zeros.length) {
                let zero = zeros.shift();
                let adjTiles = board.getAdjTiles(zero);

                // Every tile adjacent to zero added to array to be flipped
                for(let adj of adjTiles) {
                    if(!flipTiles.includes(adj)) {
                        flipTiles.push(adj);

                        // If adjacent tiles are also zeros, add them to array
                        if(adj.numAdjMines === 0) zeros.push(adj);
                    }
                }
            }
        }
    
        // Flip all tiles in the queue
        for(let flip of flipTiles) {
            flip.isFaceUp = true;
            if(flip.flag) {
                flagCount++;
                flagDisplay.innerText = flagCount;
                flip.flag = false;
            }
            flip.draw();
        }
        
        // If all non-mine tiles are face up, game is won. Stop timer, draw treasure chest
        if(board.checkWin()) {
            gameOver = true;
            clearInterval(timeInterval);
            canvasDraw.drawBox(target);
            canvasDraw.drawFace(target, 'treasure');
        }
    }
    
    // Toggles flag and increments or decrements count as appropriate
    function _rightClick(target) {
        target.flag ^= true;
        target.draw();
        target.flag ? flagCount-- : flagCount++;
        flagDisplay.innerText = flagCount;
    }

    function _advanceTimer() {
        timeElapsed++;
        timeDisplay.innerText = timeElapsed;
    }
})();

const canvasDraw = (function() {

    // Private variables
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let digImg;
    let flagImg;
    let mineImg;
    
    canvas.addEventListener('mousemove', game.mouseEvent);
    canvas.addEventListener('mouseout', game.mouseEvent);
    canvas.addEventListener('mouseup', game.mouseEvent);
    canvas.addEventListener('contextmenu', event => event.preventDefault());

    // Public methods
    return {
        initialize,
        buildCanvas,
        drawBox,
        drawNum,
        drawFace
    }

    // Called once on window load--first loads all images, then resets the game to build the gameboard
    // Promise chain to force waiting for asynchronous image loading before drawing gameboard
    // Could also be accomplished with static initialization block and no load event listener, but these are not supported in Safari
    function initialize() {
        _getImages().then(game.resetGame).catch(error => { console.log(error) });
    }

    // Once board size has been defined at instantiation, set canvas width to fit all tiles
    function buildCanvas(rows, cols, tileSize) {
        let width = cols * tileSize; 
        let height = rows * tileSize;

        // The following resizes the canvas to account for higher pixel densities
        // Withtout these steps, canvas appears blurry on retina displays
        const dpr = window.devicePixelRatio; // Ratio of physical pixels to virtual pixels, DPR = 2 for retina displays, 1 for standard
        
        // Sets the canvas size to total number of physical pixels in desired virtual width/height
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Sets the canvas element size to desired width/height of virtual pixels (CSS accounts for DPR, Canvas does not)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Scales the context to fill element size
        ctx.scale(dpr, dpr);
    }

    function drawBox(tile) {
        let red = 'c6311c';
        let lightTan = 'ddca94';
        let lightBrown = 'b8a368';
        let darkBrown = '443817';
        let blue = '97cdc8';
        let tileColor;

        if(tile.isFaceUp) {
            if(tile.mine) tileColor = red;
            else if(tile.numAdjMines) tileColor = lightTan;
            else tileColor = blue;
        } else {
            tileColor = tile.hover ? lightTan : lightBrown; 
        }

        ctx.beginPath();
        ctx.strokeStyle = `#${darkBrown}`;
        ctx.lineWidth = 1;
        ctx.fillStyle = `#${tileColor}`;
        ctx.rect(tile.x, tile.y, tile.size, tile.size);
        ctx.fill();
        ctx.stroke();
    }

    function drawNum(tile) {
        let textColor;

        // Assign color based on number of face
        switch(tile.numAdjMines) {
            case 1:
                textColor = 'blue';
                break;
            case 2:
                textColor = 'green';
                break;
            case 3:
                textColor = 'red';
                break;
            case 4:
                textColor = 'navy';
                break;
            case 5:
                textColor = 'brown';
                break;
            case 6:
                textColor = 'teal';
                break;
            case 7:
                textColor = 'black';
                break;
            case 8:
                textColor = 'gray';
        }

        let fontSize = tile.size / 2;
        ctx.beginPath();
        ctx.textAlign = 'center';
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = textColor;
        ctx.fillText(tile.numAdjMines, tile.x + tile.size / 2, tile.y + tile.size / 2);
    }

    function drawFace(tile, face) {
        let image;
        switch(face) {
            case 'dig':
                image = digImg;
                break;
            case 'mine': 
                image = mineImg;
                break;
            case 'flag':
                image = flagImg;
                break;
            case 'treasure':
                image = treasureImg;
        }

        ctx.drawImage(image, tile.x, tile.y, tile.size, tile.size);
    }

    // Private method called from initialize() function on window load, creates images from png files
    async function _getImages() {
        let imgNames = ['spade', 'pirate-flag', 'mine-explosion', 'open-treasure-chest'];
        [digImg, flagImg, mineImg, treasureImg] = await Promise.all(imgNames.map(imgName => {
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.onload = () => { resolve(img) };
                img.onerror = () => { reject(`could not load image: ${imgName}.png`) }
                img.src = `images/${imgName}.png`;
            });
        }));
    }
})();

window.addEventListener('load', canvasDraw.initialize);