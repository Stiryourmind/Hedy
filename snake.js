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
	