const fontDogica = new FontFace('Dogica', 'url(DOGICA.TTF)');
const fontGroutpix = new FontFace('Groutpix Flow', 'url(GroutpixFlowSlab.ttf)');
const fontPixelGamer = new FontFace('Pixel Gamer', 'url(PixelGamer.otf)');

Promise.all([fontDogica.load(), fontGroutpix.load(), fontPixelGamer.load()]).then(function(fonts) {
    fonts.forEach(f => document.fonts.add(f));
});

//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//game state
let gameState = "start";

let titleText = new Image();
titleText.src = "./title text.png";
let startText = new Image();
startText.src = "./start text.png";

//nugget object
let nuggetWidth = 33.95;
let nuggetHeight = 35;
let nuggetX = boardWidth/8;
let nuggetY = boardHeight/2;
let nugget = {
    x : nuggetX,
    y : nuggetY,
    width : nuggetWidth,
    height : nuggetHeight
}

//fry pipe objects
let pipeArray = [];
let pipeWidth = 68;
let pipeHeight = 400; 
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let topPipeImgs = [new Image(), new Image(), new Image(), new Image()];
topPipeImgs[0].src = "./friestop1.png";
topPipeImgs[1].src = "./friestop2.png";
topPipeImgs[2].src = "./friestop3.png";
topPipeImgs[3].src = "./friestop4.png";

let bottomPipeImgs = [new Image(), new Image(), new Image(), new Image()];
bottomPipeImgs[0].src = "./friesbottom1.png";
bottomPipeImgs[1].src = "./friesbottom2.png";
bottomPipeImgs[2].src = "./friesbottom3.png";
bottomPipeImgs[3].src = "./friesbottom4.png";

let coinImg = new Image();
coinImg.src = "./coin.png";
let coinArray = [];

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //nugget jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;
let bestScore = 0;

let gameOverBg = new Image();
gameOverBg.src = "game over screen assets/game over box.png";
let gameOverTextImg = new Image();
gameOverTextImg.src = "game over screen assets/game over text.png"; 
let tryYesButton = new Image();
tryYesButton.src = "game over screen assets/yes button.png"
let tryNoButton = new Image();
tryNoButton.src = "game over screen assets/no button.png"

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // draw nugget
    context.fillStyle = "transparent";
    context.fillRect(nugget.x, nugget.y, nugget.width, nugget.height);

    //load nugget image
    nuggetImg = new Image();
    nuggetImg.src = "./mcnugget.png";
    nuggetImg.onload = function() {
        drawStartScreen(); // Draw start screen after nugget loads
    }

    topPipeImg = new Image();
    topPipeImg.src = "./friestop3.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./friesbottom3.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1500ms = 1.5s
    document.addEventListener("keydown", handleStartScreen);
}

function drawStartScreen() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(nuggetImg, nugget.x, nugget.y, nugget.width, nugget.height);
    context.drawImage(titleText, board.width/2 - 125, 90, 250, 130);
    context.drawImage(startText, board.width/2 - 80, 500, 160, 80);

}

function handleStartScreen(e) {
    if (gameState === "start" && (e.code === "Space" || e.code === "Enter")) {
        gameState = "playing";
        document.removeEventListener("keydown", handleStartScreen);
        document.addEventListener("keydown", moveNugget);
        requestAnimationFrame(update);
    }
}

function update() {
    if (gameState !== "playing") return;
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // nugget on canvas
    velocityY += gravity;
    // nugget.y += velocityY;
    nugget.y = Math.max(nugget.y + velocityY, 0); //either apply gravity to current nugget.y or limit bird to canvas
    context.drawImage(nuggetImg, nugget.x, nugget.y, nugget.width, nugget.height);

    if (nugget.y > board.height) {
        gameOver = true;
    }

    
    // fry pipes on canvas
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        // FOR PIPES TO BE SQUARE:
        // context.fillStyle = "#ffcb4a";
        // context.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);


        // FOR PIPE-BASED SCORING:
        // if (!pipe.passed && nugget.x > pipe.x + pipe.width) {
        //     score += 0.5; // because there are 2 pipes
        //     pipe.passed = true;
        // }

        if (detectCollision(nugget, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array

    }

    for (let i = 0; i < coinArray.length; i++) {
        let coin = coinArray[i];
        coin.x += velocityX;
        if (!coin.collected) {
            context.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);
            if (detectCollision(nugget, coin)) { // coin scoring mechanism
                score += 1;
                coin.collected = true;
                // Optionally, increase score or play sound here
            }
        }
    }

    // Remove coins that have gone off screen or collected
    while (coinArray.length > 0 && (coinArray[0].x < -32 || coinArray[0].collected)) {
        coinArray.shift();
    }

    //score
    context.fillStyle = "white";
    context.font="45px 'Dogica', sans-serif";
    context.fillText(score, board.width/2, 60);

    if (gameOver) {
        if (score > bestScore) {
            bestScore = score;
        }

        context.drawImage(gameOverTextImg, board.width/2 - 95, 80, 190, 160);
        context.drawImage(gameOverBg, board.width/2 - 135, 240, 270, 180);
        
        context.fillStyle = "black";
        context.font = "14px 'Dogica', sans-serif";
        context.textAlign = "center";
        context.fillText("SCORE: " + score, board.width/2 + 50, 300);
        context.fillText("BEST: " + bestScore, board.width/2 + 50, 320);

        context.font = "18px 'Pixel Gamer', sans-serif";
        context.fillText("ANOTHER TRY?", board.width/2, 365);
        // context.fillText("GAME OVER", 5, 90);

        context.drawImage(tryYesButton, board.width/2 - 60, 370, 40, 30);
        context.drawImage(tryNoButton, board.width/2 + 20, 370, 40, 30);

    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topIndex = Math.floor(Math.random() * topPipeImgs.length);
    let bottomIndex = Math.floor(Math.random() * bottomPipeImgs.length);

    let topPipe = {
        img: topPipeImgs[topIndex],
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImgs[bottomIndex],
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);

    let coinSize = 32;
    let coin = {
        x: pipeX + pipeWidth/2 - coinSize/2,
        y: randomPipeY + pipeHeight + openingSpace/2 - coinSize/2,
        width: coinSize,
        height: coinSize,
        collected: false
    }
    coinArray.push(coin);
}

function moveNugget(e) {
    if (e.code == "Space" || e.code == "ArrowUp") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            nugget.y = nuggetY;
            pipeArray = [];
            coinArray = [];
            score = 0;
            gameOver = false
        }
    }
    
}

function detectCollision(a,b) {
    return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
} 