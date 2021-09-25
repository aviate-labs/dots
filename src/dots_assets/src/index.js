import { StoicIdentity } from "ic-stoic-identity";
import { Actor, HttpAgent } from '@dfinity/agent';
import { canisterId, dots } from "../../declarations/dots";
import { idlFactory } from '../../declarations/dots/dots.did.js';

let stoicIdentity = false;
let gameActor = dots;

const highscoreElement = document.getElementById("highscore");

let btn = document.getElementById("stoic");
btn.addEventListener("click", async () => {
  StoicIdentity.load().then(async identity => {
    if (identity === false) {
      identity = await StoicIdentity.connect();
    }

    const agent = new HttpAgent({ identity });

    // Fetch root key for certificate validation during development
    if (process.env.NODE_ENV !== "production") {
      agent.fetchRootKey().catch(err => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }

    stoicIdentity = identity;
    btn.innerText = identity.getPrincipal().toText();
    btn.classList.add("btnDisable");

    gameActor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
      // ...options?.actorOptions,
    });

    let highscore = await gameActor.getScore();
    highscoreElement.innerText = `Highscore = ${highscore}`;
  })
});

const sketchContainer = document.getElementById("sketch-container");
const scoreElement = document.getElementById("score");

const sketch = (p) => {
  let started  = false;
  let gameOver = false;
  let gameOverMsg = "";
  let errorOccured = false;

  let numSegments = 10;
  let direction = 'right';
  const xStart = 0;   // Starting x coordinate for snake
  const yStart = 250; // Starting y coordinate for snake
  const diff = 10;

  let xCor = [];
  let yCor = [];

  let xFruit = 0;
  let yFruit = 0;
  let fruit = [];
  let score = 0;

  let t = 0; // For animation.

  function init() {
    p.background(255);

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
      case 13: // ENTER
        if (!started) {
          started = true;
          p.background(0);
        }
        if (gameOver) {
          init();
        }
        break;
      case 65: // LEFT
      case 37:
        if (direction !== 'right') {
          direction = 'left';
        }
        break;
      case 68: // RIGHT
      case 39:
        if (direction !== 'left') {
          direction = 'right';
        }
        break;
      case 87: // UP
      case 38:
        if (direction !== 'down') {
          direction = 'up';
        }
        break;
      case 83: // DOWN
      case 40:
        if (direction !== 'up') {
          direction = 'down';
        }
        break;
    }
  };

  p.draw = () => {
    // Error/GameOver animated screen.
    if (errorOccured || !started || gameOver) {
      if (errorOccured) {
        p.background(0, 10);
        p.noStroke();
        p.fill(255);
        p.textSize(50);
        p.text(`Error!\nError!\nError!\n`, p.width/2, p.height/2-50);
        p.stroke(255, 0, 0);
      } else if (gameOver) {
        p.background(255, 10);
        p.noStroke();
        p.fill(255);
        p.textSize(50);
        p.text(`Game Over!\nScore = ${score}`, p.width/2, p.height/2-25);
        p.stroke(10);
      } else {
        p.background(10, 10);
        p.stroke(255);
        p.fill(0);
        p.textSize(30);
        p.text("Press 'Enter' to Start", p.width/2, p.height/2);
      }
      
      const xAngle = p.map(0, 0, p.width, -4 * p.PI, 4 * p.PI, true);
      const yAngle = p.map(0, 0, p.height, -4 * p.PI, 4 * p.PI, true);
      for (let x = 0; x <= p.width + 30; x = x + 30) {
        for (let y = 0; y <= p.height + 30; y = y + 30) {
          // Varies based on the particle's location
          const angle = xAngle * (x / p.width) + yAngle * (y / p.height);

          // Each particle moves in a circle
          const myX = x + 20 * p.cos(2 * p.PI * t + angle);
          const myY = y + 20 * p.sin(2 * p.PI * t + angle);
          p.ellipse(myX, myY, 10);
        }
      }
      t = t + 0.01;

      if (errorOccured) {
        p.textSize(20);
        p.noStroke();
        p.text(`Could not contact the canister...`, p.width/2, p.height-50);
      };
      if (gameOver) {
        p.textSize(20);
        p.noStroke();
        p.text(gameOverMsg, p.width/2, p.height-50);
      };
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

  async function checkGameStatus() {
    let collided = checkSnakeCollision();
    if (
      xCor[xCor.length - 1] > p.width ||
      xCor[xCor.length - 1] < 0 ||
      yCor[yCor.length - 1] > p.height ||
      yCor[yCor.length - 1] < 0 ||
      collided
    ) {
      p.background(255);
      gameOver = true;
      if (collided) {
        gameOverMsg = "Don't eat your own tail..."
      } else {
        gameOverMsg = "You smashed against the wall!"
      }
      if (stoicIdentity !== false) {
        let previousScore = await gameActor.getScore();
        console.log(previousScore, fruit.length);
        if (previousScore < score) {
          fruit.pop()
          console.log(await gameActor.submitScores(fruit));
          highscoreElement.innerText = `Highscore = ${score}`;
        };
        fruit.length = 0;
      }
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

  async function updateFruitCoordinates() {
    let coords = await gameActor.getFreshCoords().catch(e => {
      console.error(e);
      errorOccured = true;
      return;
    });
    xFruit = p.floor(Number(coords[0]) / 10) * 10;
    yFruit = p.floor(Number(coords[1]) / 10) * 10;
    fruit.push(coords);
  }
};

new p5(sketch, sketchContainer);
