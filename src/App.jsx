import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Dashboard from './pages/Dashboard';
import GameSelection from './pages/GameSelection';
import GameRoom from './pages/GameRoom';
import { setTheme } from './store/themeSlice';
import './App.css';

// Classic puzzles
import SlidingPuzzle from './pages/games/SlidingPuzzle';
import MemoryMatch from './pages/games/MemoryMatch';
import JigsawPuzzle from './pages/games/JigsawPuzzle';
import Sudoku from './pages/games/Sudoku';

// Word & language
import WordleClone from './pages/games/WordleClone';
import Crossword from './pages/games/Crossword';
import WordSearch from './pages/games/WordSearch';
import AnagramSolver from './pages/games/AnagramSolver';

// Logic & strategy
import Minesweeper from './pages/games/Minesweeper';
import TowerOfHanoi from './pages/games/TowerOfHanoi';
import Game2048 from './pages/games/Game2048';
import Nonogram from './pages/games/Nonogram';

// Multiplayer / real-time
import TriviaQuiz from './pages/games/TriviaQuiz';
import DrawAndGuess from './pages/games/DrawAndGuess';
import Chess from './pages/games/Chess';
import MultiplayerSnake from './pages/games/MultiplayerSnake';
import ArrowLauncher from './pages/games/ArrowLauncher';

function App() {
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const themes = useSelector((state) => state.theme.themes);
  const dispatch = useDispatch();

  return (
    <Router>
      <div className={`min-h-screen theme-${currentTheme} bg-[var(--bg-primary)] transition-colors duration-500`}>
        {/* Simple Theme Selector for Testing */}
        <div className="fixed bottom-4 right-4 z-50 flex gap-2 overflow-x-auto max-w-[90vw] p-2 bg-black/50 backdrop-blur-md rounded-full shadow-lg border border-white/10">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => dispatch(setTheme(theme.id))}
              className={`px-3 py-1 text-xs rounded-full transition-all ${currentTheme === theme.id
                ? 'bg-white text-black font-bold'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              title={theme.name}
            >
              {theme.name}
            </button>
          ))}
        </div>

        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          {/* ... existing routes ... */}
          <Route path="/game/arrow-launcher" element={<ArrowLauncher />} />
          <Route path="/game/:gameId" element={<GameSelection />} />
          <Route path="/room/:roomId" element={<GameRoom />} />
          <Route path="/game/sliding-puzzle" element={<SlidingPuzzle />} />
          <Route path="/game/memory-match" element={<MemoryMatch />} />
          <Route path="/game/jigsaw-puzzle" element={<JigsawPuzzle />} />
          <Route path="/game/sudoku" element={<Sudoku />} />
          <Route path="/game/wordle-clone" element={<WordleClone />} />
          <Route path="/game/crossword" element={<Crossword />} />
          <Route path="/game/word-search" element={<WordSearch />} />
          <Route path="/game/anagram-solver" element={<AnagramSolver />} />
          <Route path="/game/minesweeper" element={<Minesweeper />} />
          <Route path="/game/tower-of-hanoi" element={<TowerOfHanoi />} />
          <Route path="/game/2048" element={<Game2048 />} />
          <Route path="/game/nonogram" element={<Nonogram />} />
          <Route path="/game/trivia-quiz" element={<TriviaQuiz />} />
          <Route path="/game/draw-and-guess" element={<DrawAndGuess />} />
          <Route path="/game/chess" element={<Chess />} />
          <Route path="/game/multiplayer-snake" element={<MultiplayerSnake />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
