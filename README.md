# DOTS ...

## Deploying Backend Canister

```shell
dfx deploy --network=ic dots --argument {entropy}
```

## Create a Score Dump

```shell
dfx canister --network=ic call dots metascoreScores >> dump/10:25.09.2021.scores
```
