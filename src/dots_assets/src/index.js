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

const sketch = (p) => {
  const position = {
    x : 0,
    y : 0
  };

  p.setup = () => {
    const containerPos = sketchContainer.getBoundingClientRect();
    const cnv = p.createCanvas(containerPos.width, containerPos.height); //the canvas!

    cnv.mousePressed(() => {
      position.x = p.mouseX;
      position.y = p.mouseY;
    });
    p.fill(255);
    p.frameRate(30);
  };

  p.draw = () => {
    p.background(0);
    p.circle(position.x, position.y, 10)
  };
};

new p5(sketch, sketchContainer);
