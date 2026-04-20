import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GameSelection from './pages/GameSelection';
import GameRoom from './pages/GameRoom';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Fallback generic route */}
          <Route path="/game/:gameId" element={<GameSelection />} />
          <Route path="/room/:roomId" element={<GameRoom />} />

          {/* Classic puzzles */}
          <Route path="/game/sliding-puzzle" element={<SlidingPuzzle />} />
          <Route path="/game/memory-match" element={<MemoryMatch />} />
          <Route path="/game/jigsaw-puzzle" element={<JigsawPuzzle />} />
          <Route path="/game/sudoku" element={<Sudoku />} />

          {/* Word & language */}
          <Route path="/game/wordle-clone" element={<WordleClone />} />
          <Route path="/game/crossword" element={<Crossword />} />
          <Route path="/game/word-search" element={<WordSearch />} />
          <Route path="/game/anagram-solver" element={<AnagramSolver />} />

          {/* Logic & strategy */}
          <Route path="/game/minesweeper" element={<Minesweeper />} />
          <Route path="/game/tower-of-hanoi" element={<TowerOfHanoi />} />
          <Route path="/game/2048" element={<Game2048 />} />
          <Route path="/game/nonogram" element={<Nonogram />} />

          {/* Multiplayer / real-time */}
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
