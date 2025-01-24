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