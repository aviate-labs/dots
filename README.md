# DOTS ...

This is a project build for DSCVR's 2nd Hackathon, build in less than 1 day. So there are probably some bugs here and there...

I (currently) do not plan to actively contribute to this project. But feel free to open PRs and add new features, I am happy to review and maintain it.

## [Metascore](https://github.com/metascore)

DOTS participated in the initial launch of Metascore (*22-25 Sept 2021*), the scores of this period can be found in the [dump](./dump) directory.

Since the score mechanism is **not on point**, and **not safe** against cheaters, it will not participate in other Metascore championships. A more in detailed explanation below.

## Proof of Work

A first problem I stumbled upon was: 'How to send score to the backend canister, tamperproof?'. There are various ways of doing this. I needed a quick and easy solution, since this was a hackathon project.

So, I decided to not open-source the code immediately to make it at least a little harder to cheat. Which worked.

How can we validate if the user did send a fake highscore?

1. Generate the food location in the backend canister.
2. Add some hash that only the backend can create/validate.
3. Done.

Not quite... Since the user can still just query a series of food coordinates, lets say a 1000. And then send the these as their new score to the backend.

Because of this is now public information, the game will not participate in upcoming Metascore championships.

> If you have an easy was to make it tamperproof, feel free to open a PR to add this to the game!

## Usage

### Deploying Backend Canister

```shell
dfx deploy --network=ic dots --argument {entropy}
```

### Create a Score Dump

```shell
dfx canister --network=ic call dots metascoreScores >> dump/10:25.09.2021.scores
```
