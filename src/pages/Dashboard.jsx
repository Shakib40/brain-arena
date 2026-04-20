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
        },
        {
          id: 'arrow-launcher',
          name: 'Arrow Launcher',
          description: 'Precision archery challenge: hit moving targets!',
          icon: 'emoji',
          emoji: 'emoji',
          maxPlayers: 1,
          gameType: 'action',
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
      'arrow-launcher': '🏹',
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
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'multiplayer':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'both':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-6xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Puzzle Arena
        </h1>
        <p className="text-xl opacity-70 mb-8" style={{ color: 'var(--text-primary)' }}>
          Select a challenge and test your skills
        </p>

        <div className="flex justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Single player
          </div>
          <div className="flex items-center gap-2 text-sm opacity-80">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Multiplayer
          </div>
          <div className="flex items-center gap-2 text-sm opacity-80">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            Both modes
          </div>
        </div>
      </header>

      {Object.entries(gameCategories).map(([categoryKey, category]) => (
        <div key={categoryKey} className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
            {category.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {category.games.map((game) => (
              <div
                key={game.id}
                onClick={() => handleGameClick(game.id)}
                className="game-card glass-panel clay-tile neon-glow group relative overflow-hidden rounded-2xl p-8 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  backgroundColor: 'var(--tile-bg)',
                  borderColor: 'var(--tile-border)'
                }}
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">
                  {getGameEmoji(game.id)}
                </div>
                <div className="mb-4">
                  <span className={`inline-block text-[10px] uppercase font-bold px-3 py-1 rounded-full ${getBadgeColor(game.mode)}`}>
                    {getBadgeText(game.mode)}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {game.name}
                </h3>
                <p className="text-sm opacity-60 mb-6 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                  {game.description}
                </p>
                <div className="flex justify-between items-center text-xs font-semibold opacity-70">
                  <span className="flex items-center gap-2">
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
