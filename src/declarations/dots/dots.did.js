export const idlFactory = ({ IDL }) => {
  const Coordinate = IDL.Tuple(
    IDL.Nat16,
    IDL.Nat16,
    IDL.Nat,
    IDL.Vec(IDL.Nat8),
  );
  const Metadata = IDL.Record({
    'name' : IDL.Text,
    'playUrl' : IDL.Text,
    'flavorText' : IDL.Opt(IDL.Text),
  });
  const RegisterCallback = IDL.Func([Metadata], [], []);
  const Player = IDL.Variant({
    'plug' : IDL.Principal,
    'stoic' : IDL.Principal,
  });
  const Score = IDL.Tuple(Player, IDL.Nat);
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Game = IDL.Service({
    'getFreshCoords' : IDL.Func([], [Coordinate], ['query']),
    'getScore' : IDL.Func([], [IDL.Nat], ['query']),
    'metascoreRegisterSelf' : IDL.Func([RegisterCallback], [], []),
    'metascoreScores' : IDL.Func([], [IDL.Vec(Score)], ['query']),
    'register' : IDL.Func([IDL.Principal], [Result], []),
    'sendNewScores' : IDL.Func([IDL.Vec(Score)], [], []),
    'submitScores' : IDL.Func([IDL.Vec(Coordinate)], [Result], []),
    'unregister' : IDL.Func([IDL.Principal], [Result], []),
  });
  return Game;
};
export const init = ({ IDL }) => { return [IDL.Nat32]; };
