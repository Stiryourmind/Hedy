const CELL_SIZE = 20;
const MARGIN_X = 30;
const MARGIN_Y = 30;
const xOffset = 10;
const yOffset = 10;
const outerFrameOffset = 16;

let gridWidth = 15;
let gridHeight = 21;
let shapes = [];
let w, h;
let bgColor;
let chineseFont;
let englishFont;
let input, addButton;
let myText = '蛇年快樂'; // Default text to show initially


function preload() {
    chineseFont = loadFont('HanyiSentyPagodaRegular.ttf'); //Chinese font
    englishFont = loadFont('SnakeChan.otf'); //English font
}

function setup() {
    // Set the white background for the entire page
    document.body.style.backgroundColor = 'rgb(242,241,229)';

    createCanvas(800, 300);
    bgColor = color(255, 0, 0);
	
    // Create input box
    input = createInput('');
    input.size(200, 50);
    input.position(50, 50);
    input.style('font-size', '16px');
    input.style('padding', '5px');
    input.style('border', '2px solid rgb(0,0,0)'); // Add gray outline stroke
    input.style('border-radius', '5px'); // Optional: round corners

    // Create button with multi-colored text
    addButton = createButton('');
    addButton.size(200, 62);
    addButton.position(input.x + input.width + 20, 50);
    addButton.style('font-size', '16px');
    addButton.style('background-color', 'rgb(244,217,67)');
    addButton.style('padding', '5px');
    addButton.style('border', '2px solid rgb(0,0,0)');
    addButton.style('border-radius', '5px');
    addButton.mousePressed(updateText);

    // Add multi-colored styles to the button text
    addButton.html(`
        <span style="color: rgb(0,0,0);">點蛇成⾦</span> 
        <span style="color: rgb(0,0,0);">☺~====(:>)</span>
        <span style="color: rgb(255,215,0);">㊎</span>
    `);

    initializeDrawing();
}

function initializeDrawing() {
    background(bgColor);
    strokeJoin(ROUND);


    w = width - MARGIN_X * 2;
    h = height - MARGIN_Y * 2;

    gridWidth = floor(w / CELL_SIZE);
    gridHeight = floor(h / CELL_SIZE);

    shapes = [];
    const freeCells = new Array(gridWidth * gridHeight).fill(true);
    const freeIndexes = new Set(freeCells.map((_, i) => i));

    let shape = null;
    let maxLen = Math.floor(random(10, 128));

    while (freeIndexes.size > 0) {
        if (!shape) {
            shape = [];
            const startIndex = shuffleArray(Array.from(freeIndexes))[0];
            shape.push(startIndex);
            freeIndexes.delete(startIndex);
            freeCells[startIndex] = false;
            continue;
        }

        const prevIndex = shape[shape.length - 1];
        const freeNeighbours = [
                [0, -1], // Up
                [-1, 0], // Left
                [1, 0], // Right
                [0, 1] // Down
            ]
            .filter(([xoff, yoff]) => {
                const xi = prevIndex % gridWidth;
                const yi = Math.floor(prevIndex / gridWidth);
                if (xi + xoff < 0 || xi + xoff > gridWidth - 1) return false;
                if (yi + yoff < 0 || yi + yoff > gridHeight - 1) return false;
                return true;
            })
            .map(([xoff, yoff]) => prevIndex + xoff + yoff * gridWidth)
            .filter(index => freeCells[index]);

        if (freeNeighbours.length === 0 || --maxLen <= 0) {
            shapes.push({
                shape,
                color: null
            });
            shape = null;
            maxLen = Math.floor(random(10, 128));
            continue;
        }

        const nextIndex = shuffleArray(freeNeighbours)[0];
        shape.push(nextIndex);
        freeIndexes.delete(nextIndex);
        freeCells[nextIndex] = false;
    }

    if (shapes.length > 0) {
        const maxShapeIndex = shapes.reduce((maxIndex, curr, index) =>
            curr.shape.length > shapes[maxIndex].shape.length ? index : maxIndex, 0);

        shapes.forEach((shapeObj, index) => {
            let snakeColor;
            if (index === maxShapeIndex) {
                snakeColor = color(255,200,0, 100); // Gold color for the longest shape
            } else {
                const alpha = Math.floor(random(5, 60));
                snakeColor = color(0, 0, 0, alpha);
            }
            shapeObj.color = snakeColor;
        });
    }

    drawScene();
	
}

function drawScene() {
	
	
    const cellWidth = w / gridWidth;
    const cellHeight = h / gridHeight;

    push();
    stroke(0, 100);
    strokeWeight(5);
    noFill();
    rect(MARGIN_X - outerFrameOffset, MARGIN_Y - outerFrameOffset,
        w + 2 * outerFrameOffset, h + 2 * outerFrameOffset);
    rect(MARGIN_X - xOffset, MARGIN_Y - yOffset, w + 2 * xOffset, h + 2 * yOffset);

    translate(cellWidth / 2 + MARGIN_X, cellHeight / 2 + MARGIN_Y);

    shapes.forEach(({
        shape,
        color
    }) => {
        noFill();
        stroke(color || 0);
        strokeWeight(cellWidth * 0.75);

        if (shape.length === 1) {
            const [x, y] = getPosForCellIndex(shape[0], gridWidth, gridHeight, w, h);
            point(x, y);
        } else {
            beginShape();
            shape.forEach((i) => {
                const [x, y] = getPosForCellIndex(i, gridWidth, gridHeight, w, h);
                vertex(x, y);
            });
            endShape();

            // Create the eyes of the snake at the correct position
            const [lastX, lastY] = getPosForCellIndex(shape[shape.length - 1], gridWidth, gridHeight, w, h);
            push();
            translate(lastX, lastY);
            const u = cellWidth * 0.15;
            strokeWeight(u);
            stroke(bgColor);
            point(-u * 1, -u);
            point(u * 1, -u);
            pop();
        }
    });

    pop();

    const goldFoilCount = Math.floor(random(200, 500));
    addGoldFoil(goldFoilCount);

    if (myText) {
        // Base text size
        let baseTextSize = w * 0.2;
			 fill(0); 

        // Scale down text size if the string is long
        if (myText.length > 4) {
            baseTextSize = baseTextSize * (5/ myText.length);
        }

        textSize(baseTextSize);
			let totalWidth = 0;
        let maxAscent = 0;
        let maxDescent = 0;

        myText.split('').forEach(char => {
            if (isChinese(char)) {
                textFont(chineseFont);
            } else {
                textFont(englishFont);
            }
            totalWidth += textWidth(char);
            maxAscent = max(maxAscent, textAscent()); // maxAscent
            maxDescent = max(maxDescent, textDescent()); // maxDescent
        });

        const totalHeight = maxAscent + maxDescent; // find the total height of the input string

        // center aglin the input string
        const startX = (width - totalWidth) / 2; // horizontally center
        const startY = (height - totalHeight) / 2 + maxAscent; // vertically centered, adjust the center alignment

        // create each character
        let currentX = startX; // position of currentX 
        push();
        myText.split('').forEach(char => {
            if (isChinese(char)) {
                textFont(chineseFont);
            } else {
                textFont(englishFont);
            }
            text(char, currentX, startY); // 在計算好的位置繪製文字
            currentX += textWidth(char); // update the position of X
        });
        pop();
    }
}

// Check if a character is Chinese
function isChinese(char) {
    const reg = /[\u4E00-\u9FFF]/; // Check for Chinese characters
    return reg.test(char);
}

// Add gold foil effects
function addGoldFoil(count) {
    for (let i = 0; i < count; i++) {
        let x = random(MARGIN_X, width - MARGIN_X);
        let y = random(MARGIN_Y, height - MARGIN_Y);
        let size = random(0.2, 3);
        fill(255, 215, 0, random(150, 255));
        noStroke();

        beginShape();
        for (let j = 0; j < 5; j++) {
            let angle = TWO_PI / 5 * j;
            let r = size * random(0.5, 1);
            let xOffset = r * cos(angle);
            let yOffset = r * sin(angle);
            vertex(x + xOffset, y + yOffset);
        }
        endShape(CLOSE);
    }
}

// Get coordinates for a cell index
function getPosForCellIndex(index, gridWidth, gridHeight, w, h) {
    const xi = index % gridWidth;
    const yi = Math.floor(index / gridWidth);
    const x = xi / gridWidth * w;
    const y = yi / gridHeight * h;
    return [x, y];
}

// Update text when button is pressed
function updateText() {
    addButton.style('background-color', '#00A809');
    let newText = input.value();
    if (newText) {
        myText = newText; // Update the text only if input is provided
        input.value('');
        initializeDrawing();
    }
    setTimeout(() => {
        addButton.style('background-color', 'rgb(244,217,67)');
    }, 500);
}

// Shuffle an array
function shuffleArray(array) {
    let currentIndex = array.length,
        randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}