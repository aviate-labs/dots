import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

// Public Metascore interfaces/types.
import MPlayer "mo:metascore/Player";
import MPublic "mo:metascore/Metascore";

// Example game canister for Metascore.
shared ({caller = owner}) actor class Game() : async MPublic.GameInterface = this {
 
    // Reference to the metascore canister, will be empty if the game is not yet registered.
    var metascore : ?Principal = null;
    // Simple map to keep the scores related to a player.
    var state : HashMap.HashMap<MPlayer.Player, Nat> = HashMap.HashMap<MPlayer.Player, Nat>(
        0, MPlayer.equal, MPlayer.hash,
    );

    public query func metascoreScores() : async [MPublic.Score] {
        Iter.toArray(state.entries());
    };

    public shared({caller}) func metascoreRegisterSelf(callback : MPublic.RegisterCallback) : async () {
        switch (metascore) {
            case (null)  { assert(false);         };
            case (? mID) { assert(caller == mID); };
        };

        await callback({
            name = "Dots";
            playUrl = "http://localhost:8000/";
            flavorText = ?"Not yet live...";
        });
    };

    // dfx canister --network=ic --no-wallet call dots register "(principal \"tzvxm-jqaaa-aaaaj-qabga-cai\")"
    public shared({caller}) func register(metascoreID : Principal) : async Result.Result<(), Text> {
        assert(caller == owner);
        switch (metascore) {
            case (? _)  { #ok(); };
            case (null) {
                metascore := ?metascoreID;
                let metascoreCanister : MPublic.MetascoreInterface = actor(Principal.toText(metascoreID));
                await metascoreCanister.register(Principal.fromActor(this));
            };
        };
    };

    public shared func sendNewScores(scores : [MPublic.Score]) : async () {
        switch (metascore) {
            case (null)  { assert(false); };
            case (? mID) {
                for (s in scores.vals()) {
                    state.put(s.0, s.1);
                };
                let metascore : MPublic.MetascoreInterface = actor(Principal.toText(mID));
                await metascore.scoreUpdate(scores);
            };
        };
    };
};
