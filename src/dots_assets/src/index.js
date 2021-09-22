import { StoicIdentity } from "ic-stoic-identity";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, canisterId } from "../../declarations/dots";

document.getElementById("stoic").addEventListener("click", async () => {
  StoicIdentity.load().then(async identity => {
    if (identity !== false) {
      StoicIdentity.disconnect();
      document.getElementById("stoic").innerText = "Stoic"
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
