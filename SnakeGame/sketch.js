let snake = [[20, 8]]; // Snake's initial position (center of the grid)
let direction = [0, 0]; // Initial direction: no movement
let gridSizeX = 40; // Total number of cells along the width
let gridSizeY = 16; // Total number of cells along the height
let cellSize; // Size of each cell (calculated dynamically)
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

let arrowButtons = {}; // Object to store the arrow buttons


function preload() {
    customFont  = loadFont('HanyiSentyPagodaRegular.ttf'); 
}

function setup() {
  const canvas = createCanvas(800, 300);
	canvas.position(windowWidth / 2 - width / 2, windowHeight / 2 - height / 2);
	
	//createArrowButtons(canvasX, canvasY);
  
	cellSize = width / gridSizeX; // Cell size based on the grid width

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

  frameRate(8); // Control the snake's speed
	
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
	saveButton.position(canvasX + 10, canvasY - 40); // Adjusted position relative to the canvas
  saveButton.mousePressed(() => {
    if (!isLooping()) {
      saveCanvas('snake_game', 'png');
    }
  });

	
  // Safeguard: Create the score display if it doesn't exist
  if (!scoreDisplay) {
    scoreDisplay = createDiv(`祝福 + ${score}`);
    scoreDisplay.style('font-size', '16px');
		scoreDisplay.style('font-weight', 'bold');
		scoreDisplay.style('color', 'rgb(255, 215, 0)');
    scoreDisplay.style('text-align', 'center');
  }

  // Position the score display
  scoreDisplay.position(canvasX + 10, canvasY + 10);

	// Update score function
  window.updateScore = () => {
    if (scoreDisplay) {
      scoreDisplay.html(`祝福 + ${score}`);
    } else {
      console.error('Error: scoreDisplay is undefined.');
    }
  };
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

  //frame
  //noFill();
 // stroke(255, 204, 0); //gold color for the frame
  //strokeWeight(4); // Frame thickness
  //rect(margin, margin, width - margin * 2, height - margin * 2);

	
	
  // Draw all active items
  for (let item of items) {
    item.symbol(
      item.x * cellSize + cellSize / 2,
      item.y * cellSize + cellSize / 2,
      cellSize * 1.2
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
      //noFill(); 
      //stroke(255, 204, 0);
			//strokeWeight(2);
			fill(255, 204, 0);
			noStroke();
      rect(x * cellSize, y * cellSize, cellSize, cellSize, 60); // Rounded head
			
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
      eatenSymbols[i - 1](
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2,
        cellSize * 1
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
  }
	  for (let i = 1; i < snake.length; i++) {
    if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
      gameOver();
    }
  }
}


function gameOver() {
  noLoop();
  fill(0);
	textFont(customFont);
  textSize(width/5);
  textAlign(CENTER, CENTER);
  text("蛇年快樂", width / 2, height / 2 -30);
}


  // Check for self-collision
  for (let i = 1; i < snake.length; i++) {
    if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
      noLoop(); // Stop the game
      alert("Game Over! Snake hit itself.");
    }
}

function generateNonOverlappingItem() {
  let x, y, isOverlapping;

  do {
    // Generate x and y positions within the margin
    x = floor(random(margin / cellSize, gridSizeX - margin / cellSize - 1));
    y = floor(random(margin / cellSize, gridSizeY - margin / cellSize - 1));

    // Ensure the new item does not overlap the snake or other items
    isOverlapping =
      snake.some(([sx, sy]) => sx === x && sy === y) ||
      items.some((item) => item.x === x && item.y === y);
  } while (isOverlapping);

  const type = floor(random(symbols.length));
  return { x, y, type, symbol: symbols[type] };
}


// Gold Foil
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

function createArrowButtons(saveButtonX, saveButtonY) {
  const buttonSize = 40; // Size of the triangle buttons
  const spacing = 10; // Spacing between the Save button and the arrow buttons

  // Common styles for all buttons
  const commonStyles = {
    width: '0', // Needed for triangle shapes
    height: '0', // Needed for triangle shapes
    background: 'none', 
    border: 'none', 
    padding: '0',
    position: 'absolute', // Ensure proper placement
    cursor: 'pointer', // Show pointer cursor for interactivity
  };

  //UP button
  arrowButtons.up = createButton('');
  arrowButtons.up.position(saveButtonX + buttonSize + spacing, saveButtonY - buttonSize - spacing);
  arrowButtons.up.style('border-left', `${buttonSize}px solid transparent`);
  arrowButtons.up.style('border-right', `${buttonSize}px solid transparent`);
  arrowButtons.up.style('border-bottom', `${buttonSize}px solid gold`);
  applyStyles(arrowButtons.up, commonStyles);
  arrowButtons.up.mousePressed(() => {
    direction = [0, -1]; // Move snake up
  });

  //DOWN button
  arrowButtons.down = createButton('');
  arrowButtons.down.position(saveButtonX + buttonSize + spacing, saveButtonY + buttonSize + spacing);
  arrowButtons.down.style('border-left', `${buttonSize}px solid transparent`);
  arrowButtons.down.style('border-right', `${buttonSize}px solid transparent`);
  arrowButtons.down.style('border-top', `${buttonSize}px solid gold`);
  applyStyles(arrowButtons.down, commonStyles);
  arrowButtons.down.mousePressed(() => {
    direction = [0, 1]; // Move snake down
  });

  //LEFT button
  arrowButtons.left = createButton('');
  arrowButtons.left.position(saveButtonX, saveButtonY);
  arrowButtons.left.style('border-top', `${buttonSize}px solid transparent`);
  arrowButtons.left.style('border-bottom', `${buttonSize}px solid transparent`);
  arrowButtons.left.style('border-right', `${buttonSize}px solid gold`);
  applyStyles(arrowButtons.left, commonStyles);
  arrowButtons.left.mousePressed(() => {
    direction = [-1, 0]; // Move snake left
  });

  //RIGHT button
  arrowButtons.right = createButton('');
  arrowButtons.right.position(saveButtonX + 2 * buttonSize + 2 * spacing, saveButtonY);
  arrowButtons.right.style('border-top', `${buttonSize}px solid transparent`);
  arrowButtons.right.style('border-bottom', `${buttonSize}px solid transparent`);
  arrowButtons.right.style('border-left', `${buttonSize}px solid gold`);
  applyStyles(arrowButtons.right, commonStyles);
  arrowButtons.right.mousePressed(() => {
    direction = [1, 0]; // Move snake right
  });
}

//Helper function to apply styles
function applyStyles(button, styles) {
  for (const [key, value] of Object.entries(styles)) {
    button.style(key, value);
  }
}

//keyPressed function
function keyPressed() {
  if (keyCode === UP_ARROW && direction[1] === 0) {
    direction = [0, -1]; // Move snake up
    arrowButtons.up.style('border-bottom', `${40}px solid #DAA520`); // Darker gold
  } else if (keyCode === DOWN_ARROW && direction[1] === 0) {
    direction = [0, 1]; // Move snake down
    arrowButtons.down.style('border-top', `${40}px solid #DAA520`); // Darker gold
  } else if (keyCode === LEFT_ARROW && direction[0] === 0) {
    direction = [-1, 0]; // Move snake left
    arrowButtons.left.style('border-right', `${40}px solid #DAA520`); // Darker gold
  } else if (keyCode === RIGHT_ARROW && direction[0] === 0) {
    direction = [1, 0]; // Move snake right
    arrowButtons.right.style('border-left', `${40}px solid #DAA520`); // Darker gold
  }
}

//keyReleased function
function keyReleased() {
  if (keyCode === UP_ARROW) {
    arrowButtons.up.style('border-bottom', `${40}px solid gold`); // Original gold
  } else if (keyCode === DOWN_ARROW) {
    arrowButtons.down.style('border-top', `${40}px solid gold`); // Original gold
  } else if (keyCode === LEFT_ARROW) {
    arrowButtons.left.style('border-right', `${40}px solid gold`); // Original gold
  } else if (keyCode === RIGHT_ARROW) {
    arrowButtons.right.style('border-left', `${40}px solid gold`); // Original gold
  } else if (key === 'S' || key === 's') {
    if (!isLooping()) {
      saveCanvas('snake_game', 'png'); // Save the canvas as an image
    }
}
}


function windowResized() {
  const canvas = createCanvas(800, 300);
  canvas.position(windowWidth / 2 - width / 2, windowHeight / 2 - height / 2);

  const canvasX = canvas.position().x;
  const canvasY = canvas.position().y;

  saveButton.position(canvasX + 10, canvasY - 40);
  scoreDisplay.position(canvasX + 10, canvasY + 10);
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

  // Additional decorative shapes around the flower
  //stroke(255, 204, 0); // Gold for decorations
  //strokeWeight(1);
  //noFill();
  //ellipse(0, -size * 0.8, size * 0.1); // Small circle above
  //ellipse(size * 0.6, size * 0.3, size * 0.1); // Small circle right
  //ellipse(-size * 0.6, size * 0.3, size * 0.1); // Small circle left
  pop();
}