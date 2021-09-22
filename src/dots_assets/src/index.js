import { StoicIdentity } from "ic-stoic-identity";

let stoicIdentity = false;

let btn = document.getElementById("stoic");
btn.addEventListener("click", async () => {
  StoicIdentity.load().then(async identity => {
    if (identity === false) return;
    identity = await StoicIdentity.connect();

    stoicIdentity = identity;
    btn.innerText = identity.getPrincipal().toText();
    btn.classList.add("btnDisable");
  })
});

const sketchContainer = document.getElementById("sketch-container");
const scoreElement = document.getElementById("score");

const sketch = (p) => {
  let started  = false;
  let gameOver = false;

  let numSegments = 10;
  let direction = 'right';
  const xStart = 0;   // Starting x coordinate for snake
  const yStart = 250; // Starting y coordinate for snake
  const diff = 10;

  let xCor = [];
  let yCor = [];

  let xFruit = 0;
  let yFruit = 0;
  let score = 0;

  let t = 0; // For animation.

  function init() {
    p.background(0);

    started  = false;
    gameOver = false;

    numSegments = 10;
    direction = 'right';

    updateFruitCoordinates();
    score = 0;
    scoreElement.innerText = `Score = ${score}`;
    xCor = [];
    yCor = [];
    for (let i = 0; i < numSegments; i++) {
      xCor.push(xStart + i * diff);
      yCor.push(yStart);
    }
  } 

  p.setup = () => {
    const containerPos = sketchContainer.getBoundingClientRect();
    const cnv = p.createCanvas(containerPos.width, containerPos.height); //the canvas!

    scoreElement.innerText = `Score = ${score}`;

    p.frameRate(15);
    p.stroke(255);
    p.strokeWeight(10);
    updateFruitCoordinates();

    for (let i = 0; i < numSegments; i++) {
      xCor.push(xStart + i * diff);
      yCor.push(yStart);
    }

    p.textAlign(p.CENTER);
    p.textFont("PT Mono");
  };

  p.keyPressed = (keydown) => {
    switch (keydown.keyCode) {
      case 13:
        if (!started) {
          started = true;
          p.background(0);
        }
        if (gameOver) {
          init();
        }
        break;
      case 65:
      case 37:
        if (direction !== 'right') {
          direction = 'left';
        }
        break;
      case 68:
      case 39:
        if (direction !== 'left') {
          direction = 'right';
        }
        break;
      case 87:
      case 38:
        if (direction !== 'down') {
          direction = 'up';
        }
        break;
      case 83:
      case 40:
        if (direction !== 'up') {
          direction = 'down';
        }
        break;
    }
  };

  p.draw = () => {
    if (!started || gameOver) {
      if (gameOver) {
        p.background(255, 10);
        p.noStroke();
        p.fill(255);
        p.textSize(50);
        p.text(`Game Over!\nScore = ${score}`, p.width/2, p.height/2);
        p.stroke(10);
      } else {
        p.background(10, 10);
        p.stroke(255);
        p.fill(0);
        p.textSize(30);
        p.text("Press 'Enter' to Start", p.width/2, p.height/2);
      }
      
      for (let x = 0; x <= p.width + 30; x = x + 30) {
        for (let y = 0; y <= p.height + 30; y = y + 30) {
          // starting point of each circle depends on mouse position
          const xAngle = p.map(0, 0, p.width, -4 * p.PI, 4 * p.PI, true);
          const yAngle = p.map(0, 0, p.height, -4 * p.PI, 4 * p.PI, true);
          // and also varies based on the particle's location
          const angle = xAngle * (x / p.width) + yAngle * (y / p.height);

          // each particle moves in a circle
          const myX = x + 20 * p.cos(2 * p.PI * t + angle);
          const myY = y + 20 * p.sin(2 * p.PI * t + angle);

          p.ellipse(myX, myY, 10); // draw particle
        }
      }
      t = t + 0.01;
      return;
    };

    p.background(0);
    for (let i = 0; i < numSegments - 1; i++) {
      p.line(xCor[i], yCor[i], xCor[i + 1], yCor[i + 1]);
    };
    updateSnakeCoordinates();
    checkGameStatus();
    checkForFruit();
  };

  function updateSnakeCoordinates() {
    for (let i = 0; i < numSegments - 1; i++) {
      xCor[i] = xCor[i + 1];
      yCor[i] = yCor[i + 1];
    }
    switch (direction) {
      case 'right':
        xCor[numSegments - 1] = xCor[numSegments - 2] + diff;
        yCor[numSegments - 1] = yCor[numSegments - 2];
        break;
      case 'up':
        xCor[numSegments - 1] = xCor[numSegments - 2];
        yCor[numSegments - 1] = yCor[numSegments - 2] - diff;
        break;
      case 'left':
        xCor[numSegments - 1] = xCor[numSegments - 2] - diff;
        yCor[numSegments - 1] = yCor[numSegments - 2];
        break;
      case 'down':
        xCor[numSegments - 1] = xCor[numSegments - 2];
        yCor[numSegments - 1] = yCor[numSegments - 2] + diff;
        break;
    }
  }

  function checkGameStatus() {
    if (
      xCor[xCor.length - 1] > p.width ||
      xCor[xCor.length - 1] < 0 ||
      yCor[yCor.length - 1] > p.height ||
      yCor[yCor.length - 1] < 0 ||
      checkSnakeCollision()
    ) {
      p.background(0);
      gameOver = true;
    }
  }

  function checkSnakeCollision() {
    const snakeHeadX = xCor[xCor.length - 1];
    const snakeHeadY = yCor[yCor.length - 1];
    for (let i = 0; i < xCor.length - 1; i++) {
      if (xCor[i] === snakeHeadX && yCor[i] === snakeHeadY) {
        return true;
      }
    }
  }

  function checkForFruit() {
    p.point(xFruit, yFruit);
    if (xCor[xCor.length - 1] === xFruit && yCor[yCor.length - 1] === yFruit) {
      score = score + 1;
      scoreElement.innerText = `Score = ${score}`;
      xCor.unshift(xCor[0]);
      yCor.unshift(yCor[0]);
      numSegments++;
      updateFruitCoordinates();
    }
  }

  function updateFruitCoordinates() {
    xFruit = p.floor(p.random(10, (p.width - 100) / 10)) * 10;
    yFruit = p.floor(p.random(10, (p.height - 100) / 10)) * 10;
  }
};

new p5(sketch, sketchContainer);
