import Binary "mo:encoding/Binary";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Rand "mo:rand/LFSR";
import Result "mo:base/Result";
import SHA256 "mo:sha/SHA256";
import Time "mo:base/Time";

import Debug "mo:base/Debug";

// Public Metascore interfaces/types.
import MPlayer "mo:metascore/Player";
import MPublic "mo:metascore/Metascore";

// Example game canister for Metascore.
shared ({caller = owner}) actor class Game(e : Nat32) : async MPublic.GameInterface = this {
 
    private let rand = Rand.LFSR32(?e);
    private let (entropy, _) = rand.next();

    public type Coordinate = (
        Nat16, // X
        Nat16, // Y
        Nat, // Unix Time
        [Nat8], // Hash
    );
    
    public query func getFreshCoords() : async Coordinate {
        let h = SHA256.Hash(false);
        let t = Nat64.fromNat(Int.abs(Time.now()));

        // Just doing random stuff at this point.
        let t8 = Binary.BigEndian.fromNat64(t);
        let xPos = Binary.BigEndian.toNat16([t8[7], t8[6]]) % 500;
        let yPos = Binary.BigEndian.toNat16([t8[6], t8[5]]) % 500;
        h.write(Binary.BigEndian.fromNat32(entropy));
        h.write(Binary.BigEndian.fromNat16(xPos));
        h.write(Binary.BigEndian.fromNat16(yPos));
        h.write(Binary.BigEndian.fromNat64(t));
        (xPos, yPos, Nat64.toNat(t), h.sum([]));
    };

    private func isValidCoordinate((x, y, t, hash) : Coordinate) : Bool {
        let h = SHA256.Hash(false);
        h.write(Binary.BigEndian.fromNat32(entropy));
        h.write(Binary.BigEndian.fromNat16(x));
        h.write(Binary.BigEndian.fromNat16(y));
        h.write(Binary.BigEndian.fromNat64(Nat64.fromNat(t)));
        h.sum([]) == hash;
    };

    // Reference to the metascore canister, will be empty if the game is not yet registered.
    private stable var metascore : ?Principal = null;
    // Simple map to keep the scores related to a player.
    private var scores : [(MPlayer.Player, Nat)] = []; 
    private let state : HashMap.HashMap<MPlayer.Player, Nat> = HashMap.HashMap<MPlayer.Player, Nat>(
        0, MPlayer.equal, MPlayer.hash,
    );

    system func preupgrade() {
        scores := Iter.toArray(state.entries());
    };

    system func postupgrade() {
        scores := [];
    };

    public query func metascoreScores() : async [MPublic.Score] {
        Iter.toArray(state.entries());
    };

    public shared({caller}) func submitScores(coordinates : [Coordinate]) : async Result.Result<(), Text> {
        var previousTime = 0;
        for (c in coordinates.vals()) {
            if (not isValidCoordinate(c) or c.2 < previousTime) {
                return #err("coordinates are not valid");
            };
            previousTime := c.2;
        };
        let playerId = #stoic(caller);
        let score = coordinates.size();
        switch (metascore) {
            case (null)  { #err("contact quint, something went wrong...") };
            case (? mID) {
                let metascore : MPublic.MetascoreInterface = actor(Principal.toText(mID));
                await metascore.scoreUpdate([(playerId, score)]);
                state.put(playerId, score);
                #ok();
            };
        };   
    };

    public query({caller}) func getScore() : async Nat {
        switch (state.get(#stoic(caller))) {
            case (null) { 0; };
            case (? s)  { s; };
        };
    };

    public shared({caller}) func metascoreRegisterSelf(callback : MPublic.RegisterCallback) : async () {
        switch (metascore) {
            case (null)  { assert(false);         };
            case (? mID) { assert(caller == mID); };
        };

        await callback({
            name = "Dots";
            playUrl = "https://2kvgp-zyaaa-aaaai-aappq-cai.raw.ic0.app/";
            flavorText = ?"Eehm... just snake? And a few dots here and there.";
        });
    };

    // dfx canister --network=ic --no-wallet call dots register "(principal \"tzvxm-jqaaa-aaaaj-qabga-cai\")"
    public shared({caller}) func register(metascoreID : Principal) : async Result.Result<(), Text> {
        assert(caller == owner);
        let metascoreCanister : MPublic.MetascoreInterface = actor(Principal.toText(metascoreID));
        switch (await metascoreCanister.register(Principal.fromActor(this))) {
            case (#err(e)) { #err(e); };
            case (#ok()) {
                metascore := ?metascoreID;
                #ok();
            };
        };
    };

    public shared({caller}) func unregister() : async Result.Result<(), Text> {
        assert(caller == owner);
        switch (metascore) {
            case (null)  { #err("not registered yet..."); };
            case (? metascoreID) {
                let metascoreCanister : MPublic.MetascoreInterface = actor(Principal.toText(metascoreID));
                await metascoreCanister.unregister(Principal.fromActor(this));
            };
        };
    };

    // dfx canister --network=ic --no-wallet call dots sendNewScores "(vec { record { variant { stoic = principal \"g42pg-k3n7u-4sals-ufza4-34yrp-mmvkt-psecp-7do7x-snvq4-llwrj-2ae\" }; 15 } })"
    public shared({caller}) func sendNewScores(scores : [MPublic.Score]) : async () {
        assert(caller == owner);
        switch (metascore) {
            case (null)  { assert(false); };
            case (? mID) {
                for ((playerId, score) in scores.vals()) {
                    state.put(playerId, score);
                };
                let metascore : MPublic.MetascoreInterface = actor(Principal.toText(mID));
                await metascore.scoreUpdate(scores);
            };
        };
    };
};
