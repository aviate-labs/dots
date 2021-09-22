import { StoicIdentity } from "ic-stoic-identity";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, canisterId } from "../../declarations/dots";

document.getElementById("stoic").addEventListener("click", async () => {
  StoicIdentity.load().then(async identity => {
    if (identity !== false) {
      StoicIdentity.disconnect();
      document.getElementById("stoic").innerText = "Login with Stoic"
      return;
    }
    identity = await StoicIdentity.connect();

    //Create an actor canister
    const actor = Actor.createActor(idlFactory, {
      agent: new HttpAgent({
        identity,
      }),
      canisterId,
    });

    let _ = actor; // TODO

    document.getElementById("stoic").innerText = identity.getPrincipal().toText();
  })
});

const sketchContainer = document.getElementById("sketch-container");
const scoreElement = document.getElementById("score");

const sketch = (p) => {
  let numSegments = 10;
  let direction = 'right';
  const xStart = 0; //starting x coordinate for snake
  const yStart = 250; //starting y coordinate for snake
  const diff = 10;

  let xCor = [];
  let yCor = [];

  let xFruit = 0;
  let yFruit = 0;
  let score = 0;

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
  };

  p.keyPressed = (keydown) => {
    switch (keydown.keyCode) {
      case 74:
        if (direction !== 'right') {
          direction = 'left';
        }
        break;
      case 76:
        if (direction !== 'left') {
          direction = 'right';
        }
        break;
      case 73:
        if (direction !== 'down') {
          direction = 'up';
        }
        break;
      case 75:
        if (direction !== 'up') {
          direction = 'down';
        }
        break;
    }
  };

  p.draw = () => {
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
      p.noLoop();
      scoreElement.innerText = `GAME OVER | Score = ${score}`;
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
