import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Play, ArrowLeft } from 'lucide-react';
import { Stage, Layer, Rect, Text } from 'react-konva';

const GameRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    const mockPlayer = {
      id: 'player-1',
      name: 'Player 1',
      score: 0,
      isReady: false
    };
    setCurrentPlayer(mockPlayer);
    setPlayers([mockPlayer]);
  }, []);

  const handleReadyToggle = () => {
    if (currentPlayer) {
      const updatedPlayer = { ...currentPlayer, isReady: !currentPlayer.isReady };
      setCurrentPlayer(updatedPlayer);
      setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    }
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const renderGameCanvas = () => (
    <div className="flex justify-center items-center">
      <Stage width={800} height={600}>
        <Layer>
          <Rect
            x={0}
            y={0}
            width={800}
            height={600}
            fill="#2a2a3e"
          />
          <Text
            x={400}
            y={300}
            text="Game Canvas - Game Logic Coming Soon!"
            fontSize={24}
            fill="white"
            align="center"
            offsetX={150}
          />
        </Layer>
      </Stage>
    </div>
  );

  const renderWaitingRoom = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-xl p-8 border border-purple-600">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Game Room
        </h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Players in Room ({players.length})
          </h3>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex justify-between items-center bg-purple-900 bg-opacity-50 rounded-lg p-4"
              >
                <span className="text-white font-medium">{player.name}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  player.isReady 
                    ? 'bg-green-600 text-white' 
                    : 'bg-yellow-600 text-white'
                }`}>
                  {player.isReady ? 'Ready' : 'Not Ready'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReadyToggle}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentPlayer?.isReady
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {currentPlayer?.isReady ? 'Cancel Ready' : 'Ready to Play'}
          </button>
          
          <button
            onClick={handleStartGame}
            disabled={!players.every(p => p.isReady) || players.length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Game
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {gameStarted ? 'Game in Progress' : 'Waiting Room'}
        </h1>
        <p className="text-gray-300">Room ID: {roomId}</p>
      </div>

      {gameStarted ? renderGameCanvas() : renderWaitingRoom()}
    </div>
  );
};

export default GameRoom;
