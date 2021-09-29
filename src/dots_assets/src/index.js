const sketchContainer = document.getElementById("sketch-container");

const sketch = (p) => {
  let t = 0; // For animation.

  p.setup = () => {
    const containerPos = sketchContainer.getBoundingClientRect();
    const cnv = p.createCanvas(containerPos.width, containerPos.height);

    p.frameRate(15);
    p.stroke(255);
    p.strokeWeight(10);

    p.textAlign(p.CENTER);
    p.textFont("PT Mono");
  };

  p.draw = () => {
    p.background(10, 10);
    p.stroke(255);
    
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

    p.fill(0);
    p.textSize(50);
    p.text("Some text...", p.width/2, p.height/2 + 20);
    t = t + 0.01;
  };
};

new p5(sketch, sketchContainer);
