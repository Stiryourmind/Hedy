//UI elements
function createUI(xOffset, yOffset){
	//score display
	scoreDisplay = createDiv(`祝福 Good Luck + ${score}`);
	scoreDisplay.style('font-size', '12px');
	scoreDisplay.style('font-weight', 'bold');
	scoreDisplay.style('color', 'rgb(255, 215, 0)');
	scoreDisplay.style('text-align', 'left');
	scoreDisplay.position(xOffset + 5, yOffset + 5);
		
	//save button
	saveButton = createButton('Save Image');
	saveButton.position(xOffset +130 , yOffset -30 );
	saveButton.mousePressed(() => saveCanvas('snake_game', 'png'));
    
	//restart button
	restartButton = createButton('Restart');
	restartButton.position(xOffset +240, yOffset -30); 
	restartButton.mousePressed(restartGame);
		
	//arrom button
	createArrowButtons(xOffset, yOffset);	
}

//Arrow button
function createArrowButtons(xOffset, yOffset) {
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
	
	const buttonY = yOffset - 100; // Ypos at the top of the red canvas
		
	// UP
	arrowButtons.up = createButton('▲');
  arrowButtons.up.position(xOffset+ buttonSize, buttonY);
  applyStyles(arrowButtons.up, commonStyles);
  arrowButtons.up.mousePressed(() => (direction = [0, -1]));
		
	// DOWN
  arrowButtons.down = createButton('▼');
  arrowButtons.down.position(xOffset+ buttonSize, buttonY + buttonSize + 10);
  applyStyles(arrowButtons.down, commonStyles);
  arrowButtons.down.mousePressed(() => (direction = [0, 1]));
		
	// LEFT
  arrowButtons.left = createButton('◀');
  arrowButtons.left.position(xOffset, buttonY + buttonSize/2);
  applyStyles(arrowButtons.left, commonStyles);
	arrowButtons.left.mousePressed(() => (direction = [-1, 0]));
		
	// RIGHT 
  arrowButtons.right = createButton('▶');
  arrowButtons.right.position(xOffset+80 , buttonY + buttonSize/2);
  applyStyles(arrowButtons.right, commonStyles);
  arrowButtons.right.mousePressed(() => (direction = [1, 0]));
}
	
// Helper function to apply styles to buttons
function applyStyles(button, styles) {
	for (const [key, value] of Object.entries(styles)) {
		button.style(key, value);
	}
}

	// Update the score display
	function updateScore(){
		if (scoreDisplay) {
        scoreDisplay.html(`祝福 Good Luck + ${score}`);
		}
}