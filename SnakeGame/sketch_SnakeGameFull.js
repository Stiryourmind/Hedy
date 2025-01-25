let snake = []; // Snake's initial position (center of the grid)
let direction = [0, 0]; // Initial direction: no movement
let gridSizeX = 15; // Total number of cells along the width
let gridSizeY = 25; // Total number of cells along the height
let cellSize; // Size of each cell (calculated dynamically)
let symbols = []; // Array to store functions to draw symbols
let items = []; // Array to store active symbols on the canvas
let eatenSymbols = []; // Array to store the symbols the snake has eaten
let margin = 2; // Margin for the red frame
let customFont; 
let symbolSizeMultiplier = 1; 
let goldFoilGraphics;
let currentPhrase = "";

const AspectRatioWidth = 250;
const AspectRatioHeight = 400;

// Variable for score
let score = 0;
let saveButton;
let scoreDisplay;
let restartButton;
let arrowButtons = {}; 

let buttonSize = 40;
let xOffset, yOffset; 
let gameActive = true;

function preload() {
    customFont  = loadFont('HanyiSentyPagodaRegular.ttf'); 
}

function setup() {
	//const scaleFactor = min(windowWidth / AspectRatioWidth, windowHeight / AspectRatioHeight);
	createCanvas(AspectRatioWidth, AspectRatioHeight).parent('game-container');

	cellSize = height / gridSizeY; 
	initializeGame(); 
	createUI();
	
	//Add initial symbols
	  for (let i = 0; i < 5; i++) {
    items.push(generateNonOverlappingItem());
  }
	
	frameRate(6); // Control the snake's speed
	createGoldFoilGraphics();
	resizeGameElements(); 
}

//UI elements
function createUI(){
	//score display
	scoreDisplay = createDiv(`祝福 Good Luck + ${score}`);
	scoreDisplay.style('font-size', '12px');
	scoreDisplay.style('font-weight', 'bold');
	scoreDisplay.style('color', 'rgb(255, 215, 0)');
	scoreDisplay.style('text-align', 'left');
	//scoreDisplay.position(xOffset + 5, yOffset + 5);
	scoreDisplay.parent('game-container'); //
		
	//save button
	saveButton = createButton('Save Image');
	saveButton.parent('game-container');
	saveButton.position(10, 10);
	saveButton.mousePressed(() => saveCanvas('snake_game', 'png'));
	
    
	//restart button
	restartButton = createButton('Restart');
	restartButton.parent('game-container');
	restartButton.position(100, 10); 
	restartButton.mousePressed(restartGame);
		
	//arrom button
	createArrowButtons();	
}

//Arrow button
function createArrowButtons() {
	// Common styles for all buttons
	const commonStyles = {
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        background: 'rgb(250, 50, 0)',
        border: '2px solid rgb(255, 215, 0)',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: `${buttonSize * 0.5}px`,
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
	};
	
	
	// UP
	arrowButtons.up = createButton('▲');
	arrowButtons.up.parent('game-container');
  applyStyles(arrowButtons.up, commonStyles);
  arrowButtons.up.mousePressed(() => (direction = [0, -1]));
		
	// DOWN
  arrowButtons.down = createButton('▼');
  arrowButtons.down.parent('game-container');
  applyStyles(arrowButtons.down, commonStyles);
  arrowButtons.down.mousePressed(() => (direction = [0, 1]));
		
	// LEFT
  arrowButtons.left = createButton('◀');
  arrowButtons.left.parent('game-container');
  applyStyles(arrowButtons.left, commonStyles);
	arrowButtons.left.mousePressed(() => (direction = [-1, 0]));
		
	// RIGHT 
  arrowButtons.right = createButton('▶');
  arrowButtons.right.parent('game-container'); 
  applyStyles(arrowButtons.right, commonStyles);
  arrowButtons.right.mousePressed(() => (direction = [1, 0]));
}
	
// Helper function to apply styles to buttons
function applyStyles(button, styles) {
	for (const [key, value] of Object.entries(styles)) {
		button.style(key, value);
	}
}
	
  //Gold foil pattern
  function createGoldFoilGraphics(){
		goldFoilGraphics = createGraphics(width, height);
		const goldFoilCount = Math.floor(random(200, 500));
		addGoldFoil(goldFoilGraphics, goldFoilCount);
	}
	

//Initialize game state
function initializeGame() {
  const startX = floor(gridSizeX / 2);
  const startY = floor(gridSizeY / 2);
  snake = [[startX, startY]];
	
  symbols.push(drawSmiley); 
  symbols.push(drawGoldCoin);
  symbols.push(drawRedEnvelope);
  symbols.push(drawFuDiamond); 
  symbols.push(drawFlower);
}

//Draw Function
function draw() {
	//Red canvas
  push();
  noStroke();
  fill(250, 50, 0);
  rect(0, 0, width, height);
  pop();
	
	//Gold foil
  image(goldFoilGraphics, 0, 0);
	
	// Draw all active items
  for (let item of items) {
    item.symbol(
      item.x * cellSize + cellSize / 2,
      item.y * cellSize + cellSize / 2,
      cellSize * 1
    );
  }

  // Draw the snake
  drawSnake();
	
// Check if the game is over
    if (!isLooping()) {
        gameOver();
			  return;
		}
	// Update the snake's position
	if (direction[0] !== 0 || direction[1] !== 0) {
		updateSnake();
	}

	// Check for collisions (with items or itself)
	checkCollisions();
}

	// Draw the snake
	function drawSnake() {
		for (let i = 0; i < snake.length; i++) {
			const [x, y] = snake[i];

    // Snake Head
			if (i === 0) {
				drawSnakeHead(x, y);
			}else{
				drawSnakeBody(x, y, i);
			}
		}
	}
	
	//Snake Head
	function drawSnakeHead(x,y){
		push();
		
		fill(255, 204, 0);
		noStroke();
    rect(x * cellSize, y * cellSize, cellSize, cellSize, 20); // Rounded head
		
		
		// Snake eyes
		fill(250, 50, 0); 
		noStroke();
		const eyeOffsetX = cellSize * 0.3;
		const eyeOffsetY = cellSize * 0.25;
		const eyeSize = cellSize * 0.2;
		
		circle(x * cellSize + eyeOffsetX, y * cellSize + eyeOffsetY, eyeSize); //left eye 
		circle(x * cellSize + cellSize - eyeOffsetX, y * cellSize + eyeOffsetY, eyeSize); //right eye 
		
		pop();
	}
			
    // Snake body
	function drawSnakeBody(x, y, i){
		push();
		
		if (i - 1 < eatenSymbols.length) {
      const symbol = eatenSymbols[i - 1];
			symbol(
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2,
        cellSize * 0.85
			);
		} else {
      push();
      fill(150);
      noStroke();
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
		}
      pop();
	}

	//update Snake position
	function updateSnake() {
		const head = snake[0];
		const newHead = [head[0] + direction[0], head[1] + direction[1]];
		snake.unshift(newHead);
		
		// Add the eaten symbol to the body
		if (!checkIfEaten(newHead)) {
			snake.pop();
			if (eatenSymbols.length > snake.length - 1) {
				eatenSymbols.pop(); 
    }
  }
}
	
	function checkIfEaten(newHead) {
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (newHead[0] === item.x && newHead[1] === item.y) {
				eatenSymbols.push(symbols[item.type]);
      	items.splice(i, 1); // Remove the item from the canvas
      	items.push(generateNonOverlappingItem()); // Add a new random item to the canvas
				score++; // Increase the score
				updateScore();
      	return true;
			}
		}
		return false;
	}
	
	// Check for collisions with the frame/ itself
	function checkCollisions() {
		const head = snake[0];
  	const headX = head[0] * cellSize;
  	const headY = head[1] * cellSize;
		
		if (
			headX < 0 || // Left boundary
			headX + cellSize > width  || // Right boundary
    	headY < 0 || // Top boundary
    	headY + cellSize > height// Bottom boundary
		) {
			gameOver();
			return;
		}
		for (let i = 1; i < snake.length; i++) {
			if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
				gameOver();
				return;
			}
		}
	}
	
//Random phrase
function getRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}

	//Game over
	function gameOver() {
  noLoop();
  fill(0);
  textFont(customFont);
  textSize(height/5);
  textAlign(CENTER, CENTER);
	
	// Set the current phrase only if it's not already set
		if (currentPhrase === "") {
			currentPhrase = getRandomPhrase();
		}
	const verticalText = currentPhrase.split("");
  const charHeight = textSize() * 1.05; 
  const totalTextHeight = verticalText.length * charHeight;
  const startY = (height - totalTextHeight) / 2 + charHeight / 2 -20;
  const centerX = width / 2;

  // Draw character vertically
  for (let i = 0; i < verticalText.length; i++) {
    text(verticalText[i], centerX, startY + i * charHeight);
	}
}
	
	function generateNonOverlappingItem() {
		let x, y, isOverlapping;
		
		do {
			x = floor(random(margin / cellSize, gridSizeX - margin / cellSize));
			y = floor(random(margin / cellSize, gridSizeY - margin / cellSize));
			
			// Ensure the new item does not overlap the snake or other items
			isOverlapping =
				snake.some(([sx, sy]) => sx === x && sy === y) ||
				items.some((item) => item.x === x && item.y === y);
		} while (isOverlapping);
		
		const type = floor(random(symbols.length));
		return { x, y, type, symbol: symbols[type] };
	}
	
	// Add gold foil
	function addGoldFoil(graphics, count) {
		for (let i = 0; i < count; i++) {
			let x = random(margin, graphics.width- margin);
			let y = random(margin, graphics.height- margin);
			let size = random(0.2, 3);
			graphics.fill(255, 215, 0, random(150, 255));
			graphics.noStroke();
			
			graphics.beginShape();
			for (let j = 0; j < 5; j++) {
				let angle = TWO_PI / 5 * j;
				let r = size * random(0.5, 1);
				let xOffset = r * cos(angle);
				let yOffset = r * sin(angle);
				graphics.vertex(x + xOffset, y + yOffset);
			}
			graphics.endShape(CLOSE);
		}
	}


	function keyPressed() {
		if (keyCode === UP_ARROW && direction[1] === 0) {
			direction = [0, -1];
    	arrowButtons.up.style('background', 'rgb(180,36,0)');
		} else if (keyCode === DOWN_ARROW && direction[1] === 0) {
			direction = [0, 1];
			arrowButtons.down.style('background', 'rgb(180,36,0)');
  	} else if (keyCode === LEFT_ARROW && direction[0] === 0) {
    	direction = [-1, 0];
    	arrowButtons.left.style('background', 'rgb(180,36,0)');
  	} else if (keyCode === RIGHT_ARROW && direction[0] === 0) {
    	direction = [1, 0];
    	arrowButtons.right.style('background', 'rgb(180,36,0)');
		}
	}
	
	function keyReleased() {
  	if (keyCode === UP_ARROW) {
    	arrowButtons.up.style('background', 'rgb(250, 50, 0)');
  	} else if (keyCode === DOWN_ARROW) {
    	arrowButtons.down.style('background', 'rgb(250, 50, 0)');
  	} else if (keyCode === LEFT_ARROW) {
    	arrowButtons.left.style('background', 'rgb(250, 50, 0)');
  	} else if (keyCode === RIGHT_ARROW) {
    	arrowButtons.right.style('background', 'rgb(250, 50, 0)');
  	} else if (key === 'S' || key === 's') {
    	if (!isLooping()) {
      	saveCanvas('snake_game', 'png'); 
			}
		}
	}

	//restart game
	function restartGame(){
		// Reset the current phrase
    currentPhrase = "";
		
		initializeGame();
		direction = [0,0];
		createGoldFoilGraphics();
		items = [];
		eatenSymbols = [];
		for (let i = 0; i < 5; i++) {
			items.push(generateNonOverlappingItem());
		}
		score = 0;
		updateScore();
		
		loop();
	}
	
	// Update the score display
	function updateScore(){
		if (scoreDisplay) {
        scoreDisplay.html(`祝福 Good Luck + ${score}`);
		}
}
	
//resize	
/*	function resizeGameElements(){
	
	
		const scaleFactor = height / AspectRatioHeight;
		const newWidth = AspectRatioWidth * scaleFactor;
    	const newHeight = AspectRatioHeight * scaleFactor;
	
		resizeCanvas(newWidth, newHeight);
		cellSize = height / gridSizeY; 

		// Ensure the snake's head is within bounds after resizing
    const head = snake[0];
    const headX = head[0] * cellSize;
    const headY = head[1] * cellSize;
		
		// UI elements positioning using the scale factor
    //const canvasX = width / 2;
    //const canvasY = height / 2;
		
	scoreDisplay.position(10 * scaleFactor, 10 * scaleFactor);
    saveButton.position(0 * scaleFactor, (-30) * scaleFactor);
    restartButton.position(100 * scaleFactor, (-30) * scaleFactor);
    
    const buttonY =  height; 
    //arrowButtons.up.position(xOffset , buttonY);
    //arrowButtons.down.position(xOffset + buttonSize +10, buttonY);
    //arrowButtons.left.position(xOffset+ buttonSize *2 +20, buttonY);
    //arrowButtons.right.position(xOffset+buttonSize *3 +30, buttonY);
	//arrowButtons.up.position(xOffset + buttonSize, buttonY);
    //arrowButtons.down.position(xOffset + buttonSize, buttonY + buttonSize + 10);
    //arrowButtons.left.position(xOffset, buttonY + buttonSize / 2);
    //arrowButtons.right.position(xOffset + 80, buttonY + buttonSize / 2);
	arrowButtons.up.position(buttonSize * scaleFactor, buttonY);
    arrowButtons.down.position(buttonSize * scaleFactor, buttonY + buttonSize * scaleFactor + 10 * scaleFactor);
    arrowButtons.left.position(0 * scaleFactor, buttonY + buttonSize * scaleFactor / 2);
    arrowButtons.right.position(80 * scaleFactor, buttonY + buttonSize * scaleFactor / 2);
}
*/

function resizeGameElements() {
    // Original positions (in pixels)
    const originalPositions = {
        scoreDisplay: { x: 10, y: 10 },
        saveButton: { x: 0, y: -30 },
        restartButton: { x: 100, y: -30 },
        arrowButtons: {
            up: { x: buttonSize, y: height },
            down: { x: buttonSize, y: height + buttonSize + 10 },
            left: { x: 0, y: height + buttonSize / 2 },
            right: { x: 80, y: height + buttonSize / 2 },
        }
    };

    // Set initial positions without scaling
    scoreDisplay.position(originalPositions.scoreDisplay.x, originalPositions.scoreDisplay.y);
    saveButton.position(originalPositions.saveButton.x, originalPositions.saveButton.y);
    restartButton.position(originalPositions.restartButton.x, originalPositions.restartButton.y);

    arrowButtons.up.position(originalPositions.arrowButtons.up.x, originalPositions.arrowButtons.up.y);
    arrowButtons.down.position(originalPositions.arrowButtons.down.x, originalPositions.arrowButtons.down.y);
    arrowButtons.left.position(originalPositions.arrowButtons.left.x, originalPositions.arrowButtons.left.y);
    arrowButtons.right.position(originalPositions.arrowButtons.right.x, originalPositions.arrowButtons.right.y);
}



function windowResized() {
	const scaleFactor = min(windowWidth / AspectRatioWidth, windowHeight / AspectRatioHeight);
    const newWidth = min(windowWidth, AspectRatioWidth);
    const newHeight = min(windowHeight, AspectRatioHeight);

    // Ensure the canvas size doesn't exceed the maximum dimensions
    resizeCanvas(newWidth, newHeight);
    cellSize = newHeight / gridSizeY;

    // Resize UI elements
    resizeGameElements();
}

// Symbol Functions

function drawSmiley(x, y, size) {
	size *= symbolSizeMultiplier; 
  push();
  noFill();
  stroke(255, 204, 0); // Gold stroke style
  strokeWeight(2);
  ellipse(x, y, size); // Outer circle
  fill(255, 204, 0); // Fill for eyes
  noStroke();
  ellipse(x - size / 5, y - size / 5, size / 10); // Left eye
  ellipse(x + size / 5, y - size / 5, size / 10); // Right eye
  noFill();
  stroke(255, 204, 0);
  arc(x, y, size / 1.5, size / 1.5, 0, PI); // Smile
  pop();
}

function drawGoldCoin(x, y, size) {
	size *= symbolSizeMultiplier; 
  push();
  noFill();
  stroke(255, 204, 0); // Gold stroke style
  strokeWeight(2);
  ellipse(x, y, size); // Outer circle
  ellipse(x, y, size * 0.6); // Inner circle
  rectMode(CENTER);
  rect(x, y, size * 0.2, size * 0.2); // Inner square
  ellipse(x, y - size * 0.3, size * 0.1); // Top hole
  ellipse(x, y + size * 0.3, size * 0.1); // Bottom hole
  ellipse(x - size * 0.3, y, size * 0.1); // Left hole
  ellipse(x + size * 0.3, y, size * 0.1); // Right hole
  pop();
}

function drawRedEnvelope(x, y, size) {
  size *= symbolSizeMultiplier; // Scale the size of the red envelope
  push();
  noFill();
  stroke(255, 204, 0); // Gold stroke for the envelope
  strokeWeight(2);

  // Draw wider rectangle (envelope body)
  rectMode(CENTER);
  rect(x, y, size , size*1.2); // Wider envelope body

  // Draw envelope flap
  triangle(
    x - size * 0.4, // Left corner
    y - size * 0.6, // Top left
    x + size * 0.4, // Right corner
    y - size * 0.6, // Top right
    x, // Center point
    y - size * 0.4 // Bottom center
  );

  // Draw a larger heart
  fill(255, 204, 0); 
  noStroke();
  beginShape();
  vertex(x, y - size * 0.1); // Top of heart
  bezierVertex(
    x - size * 0.3, y - size * 0.3, // Left curve
    x - size * 0.6, y, // Left bottom
    x, y + size * 0.3 // Bottom point
  );
  bezierVertex(
    x + size * 0.6, y, // Right bottom
    x + size * 0.3, y - size * 0.3, // Right curve
    x, y - size * 0.1 // Top right
  );
  endShape(CLOSE);
  pop();
}

function drawFuDiamond(x, y, size) {
	size *= symbolSizeMultiplier; 
  push();
  noFill();
  stroke(255, 204, 0); 
  strokeWeight(2);
  translate(x, y);
  rotate(PI / 4);
  rectMode(CENTER);
  rect(0, 0, size, size); // Draw the diamond shape
  pop();

  // Draw the upside-down "福" diamond
  push();
  translate(x, y); 
  rotate(PI);
  textSize(size / 1.5); 
  textAlign(CENTER, CENTER); 
  fill(255, 204, 0); 
  noStroke();
  text("福", 0, 0);
  pop();
}

function drawFlower(x, y, size) {
  size *= symbolSizeMultiplier*0.8; // Scale the size of the flower symbol
  push();
  translate(x, y); // Center the drawing at (x, y)
  stroke(255, 204, 0); // Gold stroke for the flower
  strokeWeight(2);
  noFill();

  // Draw petals (5 petals)
  for (let i = 0; i < 5; i++) {
    ellipse(0, -size * 0.4, size * 0.5, size * 0.7); // Petal shape
    rotate((2 * PI) / 5); // Rotate for the next petal
  }

  // Center circle
  fill(255, 204, 0); 
  noStroke();
  ellipse(0, 0, size * 0.4);

  // Decorative lines inside petals
  stroke(255, 204, 0); 
  noFill();
  for (let i = 0; i < 5; i++) {
    line(0, -size * 0.3, 0, -size * 0.15); // Line inside petal
    rotate((2 * PI) / 5);
  }

  pop();
}

const phrases = [
  "蛇年快樂",
  "日日精彩",
  "心中有夢",
  "無憂無慮",
  "冇煩惱",
  "隨心所欲",
  "多姿多彩",
  "輕鬆自在",
  "勁學新野",
  "紅中發財",
  "小人退散",
  "能量滿滿",
  "幸運加倍",
  "唔洗OT",
  "水浸荷包",
  "發大達",
  "滿載而歸",
  "身體健康",
  "賺到笑",
  "食極唔肥",
  "無拘無束",
  "充滿驚喜",
  "中六合彩",
  "大癲",
  "夢想成真",
  "善待自己",
  "快樂美滿",
  "早睡早起",
  "食飽瞓飽",
  "隨心所欲",
  "贏到手軟",
  "笑唔停"
];
