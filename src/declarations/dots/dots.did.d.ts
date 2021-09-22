import type { Principal } from '@dfinity/principal';
export type Coordinate = [number, number, bigint, Array<number>];
export interface Game {
  'getFreshCoords' : () => Promise<Coordinate>,
  'getScore' : () => Promise<bigint>,
  'metascoreRegisterSelf' : (arg_0: [Principal, string]) => Promise<undefined>,
  'metascoreScores' : () => Promise<Array<Score>>,
  'register' : (arg_0: Principal) => Promise<Result>,
  'sendNewScores' : (arg_0: Array<Score>) => Promise<undefined>,
  'submitScores' : (arg_0: Array<Coordinate>) => Promise<Result>,
  'unregister' : () => Promise<Result>,
}
export interface Metadata {
  'name' : string,
  'playUrl' : string,
  'flavorText' : [] | [string],
}
export type Player = { 'plug' : Principal } |
  { 'stoic' : Principal };
export type RegisterCallback = (arg_0: Metadata) => Promise<undefined>;
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Score = [Player, bigint];
export interface _SERVICE extends Game {}
