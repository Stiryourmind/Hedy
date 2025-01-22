let aspectRatio = 300 / 500; 
let snake = []; // Snake's initial position (center of the grid)
let direction = [0, 0]; // Initial direction: no movement
let gridSizeX = 15; // Total number of cells along the width
let gridSizeY = 25; // Total number of cells along the height
let cellSize; // Size of each cell
let symbols = []; // Array to store functions to draw symbols
let items = []; // Array to store active symbols on the canvas
let eatenSymbols = []; // Array to store the symbols the snake has eaten
let margin = 18; // Margin for the red frame
let customFont; 
let symbolSizeMultiplier = 1; 
let goldFoilGraphics;

// Variable for score
let score = 0;
let saveButton;
let scoreDisplay;

let arrowButtons = {};


function preload() {
    customFont  = loadFont('HanyiSentyPagodaRegular.ttf'); 
}

function setup() {
  const canvas = createCanvas(300, 500);
canvas.position(windowWidth -width) / 2, (windowHeight - height) / 2);
cellSize = height / gridSizeY; // Cell size based on the grid width

// Initialize the snake in the center of the grid
  const startX = floor(gridSizeX / 2); // Center horizontally
  const startY = floor(gridSizeY / 2); // Center vertically
  snake = [[startX, startY]]; // Snake starts as a single segment
	
  // Add your symbols
  symbols.push(drawSmiley); // Smiley face
  symbols.push(drawGoldCoin); // Gold coin
  symbols.push(drawRedEnvelope); // Red envelope
  symbols.push(drawFuDiamond); // Upside-down 福 symbol
  symbols.push(drawFlower); // flower symbol

  // Place initial symbols on the grid without overlap
  for (let i = 0; i < 5; i++) {
    items.push(generateNonOverlappingItem());
  }

  frameRate(6); // Control the snake's speed
	
  // Create static gold foil pattern
  goldFoilGraphics = createGraphics(width, height);
  const goldFoilCount = Math.floor(random(200, 500));
  addGoldFoil(goldFoilGraphics, goldFoilCount);
	
	// Adjust positions relative to the canvas
  const canvasX = canvas.position().x;
  const canvasY = canvas.position().y;
	
	// Create the arrow buttons
  createArrowButtons(canvasX, canvasY);
	
	// Create the save image button below the canvas
  saveButton = createButton('Save Image');
	//saveButton.position(canvasX - 120, canvasY + 150); 
  saveButton.mousePressed(() => {
    if (!isLooping()) {
      saveCanvas('snake_game', 'png');
    }
  });
	
 //positionButtons(canvas.position().x, canvas.position().y);
//createArrowButtons(canvas.position().x, canvas.position().y);
	
  // scoreDisplay
	scoreDisplay = createDiv(`Good Luck + ${score}`);
	scoreDisplay.style('font-size', '16px');
		scoreDisplay.style('font-weight', 'bold');
		scoreDisplay.style('color', 'rgb(255, 215, 0)');
	scoreDisplay.style('text-align', 'center');
	scoreDisplay.position(canvasX + 10, canvasY + 10); 

// Update score function
  window.updateScore = () => {
    if (scoreDisplay) {
      scoreDisplay.html(`Good Luck + ${score}`);
    } else {
      console.error('Error: scoreDisplay is undefined.');
    }
}

// restart   	
const restartButton = createButton('Restart');
  //restartButton.position(canvasX - 110, canvasY + 200); 
  restartButton.mousePressed(restartGame);
}

function positionButtons(canvasX, canvasY) {
    const buttonHeight = height * 0.05; // Size based on canvas height

    // Position the save button
    saveButton.position(canvasX - buttonHeight * 2, canvasY + buttonHeight * 2);

    // Position the restart button
    restartButton.position(canvasX - buttonHeight * 2, canvasY + buttonHeight * 3);
}


function draw() {
  // Draw the red canvas
  push();
  noStroke();
  fill(250, 50, 0);
  rect(0, 0, width, height);
  pop();
	
	// Draw static gold foil background
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
	
  // Update the snake's position
  if (direction[0] !== 0 || direction[1] !== 0) {
    updateSnake();
  }

  // Check for collisions (with items or itself)
  checkCollisions();
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const [x, y] = snake[i];

    // Head of the snake
    if (i === 0) {
	    push();
	    fill(255, 204, 0);
	    noStroke();
	    rect(x * cellSize, y * cellSize, cellSize, cellSize, 30); // Rounded head
			
	// Snake eyes
      fill(250, 50, 0); 
      noStroke();
      const eyeOffsetX = cellSize * 0.3; // Horizontal offset for the eyes
      const eyeOffsetY = cellSize * 0.25; // Vertical offset for the eyes
      const eyeSize = cellSize * 0.2; // Size of the eyes

      // Draw left eye
      circle(x * cellSize + eyeOffsetX, y * cellSize + eyeOffsetY, eyeSize);

      // Draw right eye
      circle(x * cellSize + cellSize - eyeOffsetX, y * cellSize + eyeOffsetY, eyeSize);
			
      pop();
    }
	    
    // Body of the snake
    else if (i - 1 < eatenSymbols.length) {
      // Draw the corresponding symbol for the body part
	    const symbol = eatenSymbols[i - 1];
	    symbol(
		    x * cellSize + cellSize / 2,
		    y * cellSize + cellSize / 2,
		    cellSize * 0.9
	    );
    } else {
      // Default body (if no symbol)
      push();
      fill(150);
      noStroke();
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
      pop();
    }
  }
}

function updateSnake() {
  // Calculate new head position
  const head = snake[0];
  const newHead = [head[0] + direction[0], head[1] + direction[1]];

  // Add the new head to the front of the snake
  snake.unshift(newHead);

  // Add the eaten symbol to the body, not the head
  if (!checkIfEaten(newHead)) {
    snake.pop(); // Remove the tail if no food was eaten
    if (eatenSymbols.length > snake.length - 1) {
      eatenSymbols.pop(); // Ensure eaten symbols are synchronized with the snake length
    }
  }
}

function checkIfEaten(newHead) {
	for (let i = 0; i < items.length; i++) {
	  const item = items[i];
	  if (newHead[0] === item.x && newHead[1] === item.y) {
	    eatenSymbols.push(symbols[item.type]); // Add the eaten symbol to the body
	    items.splice(i, 1); // Remove the item from the canvas
	    items.push(generateNonOverlappingItem()); // Add a new random item to the canvas
	    score++; // Increase the score when a symbol is eaten
	    updateScore(); // Update the score display
	    return true;
	  }
	}
	return false;
}

function checkCollisions() {
  const head = snake[0];
  const headX = head[0] * cellSize;
  const headY = head[1] * cellSize;
	
	 // Check for collisions with the frame
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
	
// Check for collisions with items (symbols)
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (head[0] === item.x && head[1] === item.y) {
      // The snake eats the symbol
      eatenSymbols.push(item.symbol); // Add the symbol to the eaten queue

      // Remove the item from the items array
      items.splice(i, 1);

      // Add a new segment to the snake's body
      snake.push([...snake[snake.length - 1]]);

      // Update the score
      score++;

      // Optionally, generate a new item to replace the eaten one
      items.push(generateNonOverlappingItem());
    }
  }	
}


function gameOver() {
  noLoop();
  fill(0);
textFont(customFont);
  textSize(height/5);
  textAlign(CENTER, CENTER);
  const verticalText = "蛇年快樂".split("");
  const charHeight = textSize() * 1; // Height of each character (includes spacing)
  const totalTextHeight = verticalText.length * charHeight; // Total height of the text block

	// Calculate the starting Y position to center the text vertically
  const startY = (height - totalTextHeight) / 2 + charHeight / 2 -20;
  const centerX = width / 2; // X position stays centered horizontally

  // Draw each character vertically, centered on the canvas
  for (let i = 0; i < verticalText.length; i++) {
    text(verticalText[i], centerX, startY + i * charHeight);
  }
}


  // Check for self-collision
  for (let i = 1; i < snake.length; i++) {
    if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
      noLoop(); // Stop the game
    }
}

function generateNonOverlappingItem() {
  let x, y, isOverlapping;

  do {
    // Generate x and y positions within the margin
    x = floor(random(margin / cellSize, gridSizeX - margin / cellSize ));
    y = floor(random(margin / cellSize, gridSizeY - margin / cellSize ));

    // Ensure the new item does not overlap the snake or other items
    isOverlapping =
      snake.some(([sx, sy]) => sx === x && sy === y) ||
      items.some((item) => item.x === x && item.y === y);
  } while (isOverlapping);

  const type = floor(random(symbols.length));
  return { x, y, type, symbol: symbols[type] };
}



// Add gold foil effects
function addGoldFoil(graphics, count) {
  for (let i = 0; i < count; i++) {
    let x = random(margin, width - margin);
    let y = random(margin, height - margin);
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

function createArrowButtons(canvasX, canvasY) {
  const buttonSize = height * 0.05; // Adjust size for the buttons
  const offset = 20; // Distance between buttons

  // Common styles for all buttons
  const commonStyles = {
    width: `${buttonSize}px`,
    height: `${buttonSize}px`,
    background: 'rgb(250, 50, 0)',
    border: '2px solid rgb(255, 215, 0)',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: `${buttonSize * 0.5}px`, // Font size based on button size
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  };

  // Create UP button
  arrowButtons.up = createButton('▲');
  arrowButtons.up.position(canvasX - 100, canvasY + 20);
  applyStyles(arrowButtons.up, commonStyles);
  arrowButtons.up.mousePressed(() => (direction = [0, -1]));

  // Create DOWN button
  arrowButtons.down = createButton('▼');
  arrowButtons.down.position(canvasX - 100, canvasY + 80);
  applyStyles(arrowButtons.down, commonStyles);
  arrowButtons.down.mousePressed(() => (direction = [0, 1]));

  // Create LEFT button
  arrowButtons.left = createButton('◀');
  arrowButtons.left.position(canvasX - 140, canvasY + 50);
  applyStyles(arrowButtons.left, commonStyles);
  arrowButtons.left.mousePressed(() => (direction = [-1, 0]));

  // Create RIGHT button
  arrowButtons.right = createButton('▶');
  arrowButtons.right.position(canvasX - 60, canvasY + 50);
  applyStyles(arrowButtons.right, commonStyles);
  arrowButtons.right.mousePressed(() => (direction = [1, 0]));
}

// Helper function to apply styles
function applyStyles(button, styles) {
  for (const [key, value] of Object.entries(styles)) {
    button.style(key, value);
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
      saveCanvas('snake_game', 'png'); // Save the canvas as an image
    }
}
}


function restartGame() {
  // Reset snake position and direction
	const startX = floor(gridSizeX / 2);
  const startY = floor(gridSizeY / 2);
  snake = [[startX, startY]];
  direction = [0, 0];

  // Reset items and symbols
  items = [];
  eatenSymbols = [];
  score = 0;

  // Regenerate initial symbols
  for (let i = 0; i < 5; i++) {
    items.push(generateNonOverlappingItem());
  }
	
  // Regenerate gold foil graphics
  goldFoilGraphics = createGraphics(width, height);
  const goldFoilCount = Math.floor(random(200, 500)); // Randomize the number of gold foil pieces
  addGoldFoil(goldFoilGraphics, goldFoilCount);

  // Reset the score display
  updateScore();

  // Restart the game loop
  loop();
}


function windowResized() {
    let newWidth = windowWidth;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > windowHeight) {
        newHeight = windowHeight;
        newWidth = windowHeight * aspectRatio;
    }

    resizeCanvas(newWidth, newHeight);
    cellSize = height / gridSizeY; // Update cell size based on new height

    // Update positions of buttons
    positionButtons((windowWidth - newWidth) / 2, (windowHeight - newHeight) / 2);
    saveButton.position((windowWidth - saveButton.width) / 2, newHeight - saveButton.height - 10);
    scoreDisplay.position((windowWidth - scoreDisplay.width) / 2, 10);
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
  fill(255, 204, 0); // Gold fill for the heart
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
  stroke(255, 204, 0); // Gold stroke style
  strokeWeight(2);

  // Center the diamond at (x, y) and rotate it
  translate(x, y);
  rotate(PI / 4); // Rotate the square into a diamond
  rectMode(CENTER);
  rect(0, 0, size, size); // Draw the diamond shape
  pop();

  // Draw the upside-down "福" centered inside the diamond
  push();
  translate(x, y); // Move to the center of the diamond
  rotate(PI); // Rotate the text upside-down (180 degrees)
	//textFont(customFont); // Use the custom font
  textSize(size / 1.5); // Adjust text size proportionally to the diamond
  textAlign(CENTER, CENTER); // Center align both horizontally and vertically
  fill(255, 204, 0); // Gold color for the text
  noStroke();
  text("福", 0, 0); // Draw the text at the rotated center
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
  fill(255, 204, 0); // Gold fill for the center
  noStroke();
  ellipse(0, 0, size * 0.4);

  // Decorative lines inside petals
  stroke(255, 204, 0); // Gold stroke
  noFill();
  for (let i = 0; i < 5; i++) {
    line(0, -size * 0.3, 0, -size * 0.15); // Line inside petal
    rotate((2 * PI) / 5);
  }
  pop();
}
