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

const AspectRatioWidth = 300;
const AspectRatioHeight = 500;

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
	const canvasWidth = AspectRatioWidth;
	const canvasHeight = AspectRatioHeight;
	
	// Centered canvas
	xOffset = (windowWidth - canvasWidth) / 2;
	yOffset = (windowHeight - canvasHeight) / 2;
	createCanvas(canvasWidth, canvasHeight);
	cellSize = height / gridSizeY; 
	initializeGame(); 
	createUI(xOffset, yOffset);
	
	//Add initial symbols
	  for (let i = 0; i < 5; i++) {
    items.push(generateNonOverlappingItem());
  }
	
	frameRate(6); // Control the snake's speed
	createGoldFoilGraphics();
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

  //Gold foil pattern
  function createGoldFoilGraphics(){
    goldFoilGraphics = createGraphics(width, height);
    const goldFoilCount = Math.floor(random(200, 500));
    addGoldFoil(goldFoilGraphics, goldFoilCount);
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
	
	
//resize	
	function resizeGameElements(xOffset, yOffset){
	
		cellSize = height / gridSizeY; 
		
		// Ensure the snake's head is within bounds after resizing
    const head = snake[0];
    const headX = head[0] * cellSize;
    const headY = head[1] * cellSize;
		
		// UI elements positioning using the scale factor
    //const canvasX = width / 2;
    //const canvasY = height / 2;
		
    scoreDisplay.position(xOffset + 10, yOffset + 10);
    saveButton.position(xOffset + 130, yOffset - 30);
    restartButton.position(xOffset + 240, yOffset - 30); 
    
    const buttonY = yOffset - 100; 
    arrowButtons.up.position(xOffset + buttonSize, buttonY);
    arrowButtons.down.position(xOffset + buttonSize, buttonY + buttonSize + 10);
    arrowButtons.left.position(xOffset, buttonY + buttonSize / 2);
    arrowButtons.right.position(xOffset + 80, buttonY + buttonSize / 2);
}

function windowResized() {
    const newWidth = min(windowWidth, AspectRatioWidth);
    const newHeight = min(windowHeight, AspectRatioHeight);
    
    resizeCanvas(newWidth, newHeight);
	xOffset = (windowWidth - newWidth) / 2;
    yOffset = (windowHeight - newHeight) / 2;
    resizeGameElements(xOffset, yOffset); 
}


