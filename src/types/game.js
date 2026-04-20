export const Game = {
  id: '',
  name: '',
  description: '',
  thumbnail: '',
  maxPlayers: 0,
  gameType: 'puzzle'
};

export const GameMode = {
  type: 'single',
  players: 0
};

export const GameState = {
  game: Game,
  mode: GameMode,
  isStarted: false,
  players: []
};

export const Player = {
  id: '',
  name: '',
  score: 0,
  isReady: false
};
