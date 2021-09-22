export const idlFactory = ({ IDL }) => {
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
    'metascoreRegisterSelf' : IDL.Func([RegisterCallback], [], []),
    'metascoreScores' : IDL.Func([], [IDL.Vec(Score)], ['query']),
    'register' : IDL.Func([IDL.Principal], [Result], []),
    'sendNewScores' : IDL.Func([IDL.Vec(Score)], [], []),
  });
  return Game;
};
export const init = ({ IDL }) => { return []; };
