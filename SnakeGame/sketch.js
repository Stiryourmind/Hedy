let aspectRatio = 300 / 500; 

function setup() {
  createCanvas(300, 500);
}

function draw() {
  background(220);
  let x = width / 2;
  let y = height / 2;
  fill(0);
  ellipse(x, y, 100, 100); 
}

function windowResized() {
  let newWidth = windowWidth;
  let newHeight = windowWidth / aspectRatio; 

  if (newHeight > windowHeight) {
    newHeight = windowHeight;
    newWidth = windowHeight * aspectRatio; 
  }

  resizeCanvas(newWidth, newHeight); 
}
