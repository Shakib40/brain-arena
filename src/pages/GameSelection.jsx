import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Users, ArrowLeft } from 'lucide-react';

const GameSelection = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const handleModeSelect = (mode) => {
    const roomId = `${gameId}-${mode}-${Date.now()}`;
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Select Game Mode
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Choose how you want to play
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => handleModeSelect('single')}
            className="mode-button bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 border border-blue-500 hover:border-blue-400 transition-all"
          >
            <div className="flex justify-center mb-4 text-blue-300">
              <User className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Single Player
            </h3>
            <p className="text-gray-300">
              Play alone and practice your skills
            </p>
          </button>

          <button
            onClick={() => handleModeSelect('multiplayer')}
            className="mode-button bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-8 border border-purple-500 hover:border-purple-400 transition-all"
          >
            <div className="flex justify-center mb-4 text-purple-300">
              <Users className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Multiplayer
            </h3>
            <p className="text-gray-300">
              Play with friends or other players online
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;
