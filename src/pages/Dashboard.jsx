import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Puzzle, Swords } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const gameCategories = {
    classic: {
      title: 'Classic puzzles',
      games: [
        {
          id: 'sliding-puzzle',
          name: 'Sliding puzzle',
          description: '15-puzzle tile shuffler with move counter and timer',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 4,
          gameType: 'puzzle',
          mode: 'both'
        },
        {
          id: 'memory-match',
          name: 'Memory match',
          description: 'Flip cards to find matching pairs, track best score',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 2,
          gameType: 'puzzle',
          mode: 'both'
        },
        {
          id: 'jigsaw-puzzle',
          name: 'Jigsaw puzzle',
          description: 'Drag-and-drop image pieces with snap-to-grid',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'puzzle',
          mode: 'single'
        },
        {
          id: 'sudoku',
          name: 'Sudoku',
          description: '9×9 grid with validation, hints, and difficulty levels',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'puzzle',
          mode: 'single'
        }
      ]
    },
    word: {
      title: 'Word & language',
      games: [
        {
          id: 'wordle-clone',
          name: 'Wordle clone',
          description: 'Guess the 5-letter word in 6 tries with color hints',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 2,
          gameType: 'puzzle',
          mode: 'both'
        },
        {
          id: 'crossword',
          name: 'Crossword',
          description: 'Across/down grid with clues and auto-check',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'puzzle',
          mode: 'single'
        },
        {
          id: 'word-search',
          name: 'Word search',
          description: 'Highlight hidden words in a letter grid',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'puzzle',
          mode: 'single'
        },
        {
          id: 'anagram-solver',
          name: 'Anagram solver',
          description: 'Rearrange scrambled letters to form words',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 4,
          gameType: 'puzzle',
          mode: 'multiplayer'
        }
      ]
    },
    logic: {
      title: 'Logic & strategy',
      games: [
        {
          id: 'minesweeper',
          name: 'Minesweeper',
          description: 'Click tiles, avoid mines, use number logic',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'puzzle',
          mode: 'single'
        },
        {
          id: 'tower-of-hanoi',
          name: 'Tower of Hanoi',
          description: 'Move disks with drag-and-drop and step counter',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'puzzle',
          mode: 'single'
        },
        {
          id: '2048',
          name: '2048',
          description: 'Swipe tiles to merge numbers and reach 2048',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'puzzle',
          mode: 'single'
        },
        {
          id: 'nonogram',
          name: 'Nonogram',
          description: 'Fill grid cells from row/column number clues',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'puzzle',
          mode: 'single'
        }
      ]
    },
    multiplayer: {
      title: 'Multiplayer / real-time',
      games: [
        {
          id: 'trivia-quiz',
          name: 'Trivia quiz',
          description: 'Live buzzer rounds with score leaderboard via WebSocket',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 8,
          gameType: 'puzzle',
          mode: 'multiplayer'
        },
        {
          id: 'draw-and-guess',
          name: 'Draw & guess',
          description: 'One player draws, others guess the word in real time',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 6,
          gameType: 'puzzle',
          mode: 'multiplayer'
        },
        {
          id: 'chess',
          name: 'Chess',
          description: 'Full rules, legal move validation, vs AI or friend',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 2,
          gameType: 'puzzle',
          mode: 'both'
        },
        {
          id: 'multiplayer-snake',
          name: 'Multiplayer snake',
          description: 'Compete on same board, last snake wins',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 4,
          gameType: 'puzzle',
          mode: 'multiplayer'
        }
      ]
    }
  };

  const getGameEmoji = (gameId) => {
    const emojiMap = {
      'sliding-puzzle': '🧩',
      'memory-match': '🃏',
      'jigsaw-puzzle': '🤯',
      'sudoku': '📝',
      'wordle-clone': '🤔',
      'crossword': '📰',
      'word-search': '🔍',
      'anagram-solver': '🔄',
      'minesweeper': '💣',
      'tower-of-hanoi': '🗼️',
      '2048': '📊',
      'nonogram': '🖼️',
      'trivia-quiz': '🤓',
      'draw-and-guess': '🎨',
      'chess': '♟️',
      'multiplayer-snake': '🐍'
    };
    return emojiMap[gameId] || '🤔';
  };

  const getBadgeColor = (mode) => {
    switch (mode) {
      case 'single':
        return 'bg-green-100 text-green-800';
      case 'multiplayer':
        return 'bg-blue-100 text-blue-800';
      case 'both':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeText = (mode) => {
    switch (mode) {
      case 'single':
        return 'Single player';
      case 'multiplayer':
        return 'Multiplayer';
      case 'both':
        return 'Single + Multi';
      default:
        return 'Unknown';
    }
  };

  const handleGameClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Puzzle Game Platform
        </h1>
        <p className="text-xl text-gray-300 mb-8">Choose your game and start playing!</p>

        <div className="flex justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Single player
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Multiplayer
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            Both modes
          </div>
        </div>
      </header>

      {Object.entries(gameCategories).map(([categoryKey, category]) => (
        <div key={categoryKey} className="mb-12">
          <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wide mb-6">
            {category.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {category.games.map((game) => (
              <div
                key={game.id}
                onClick={() => handleGameClick(game.id)}
                className="game-card bg-gradient-to-br from-purple-800 to-indigo-800 rounded-xl p-6 cursor-pointer border border-purple-600 hover:border-purple-400 transition-all hover:scale-105"
              >
                <div className="text-4xl mb-4 text-center">
                  {getGameEmoji(game.id)}
                </div>
                <div className="mb-3">
                  <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${getBadgeColor(game.mode)}`}>
                    {getBadgeText(game.mode)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                  {game.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4 text-center line-clamp-2">
                  {game.description}
                </p>
                <div className="flex justify-between items-center text-sm text-purple-300">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {game.maxPlayers} {game.maxPlayers === 1 ? 'Player' : 'Players'}
                  </span>
                  <span className="capitalize">{game.gameType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
