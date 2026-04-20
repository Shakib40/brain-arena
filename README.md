# 🧩 Puzzle Game Platform

A modern, feature-rich puzzle game platform built with **React** + **Vite**. Includes 16 fully playable games across 4 categories.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 Games

### Classic Puzzles
| Game | Route | Description |
|---|---|---|
| Sliding Puzzle | `/game/sliding-puzzle` | 15-tile shuffler with move counter & timer |
| Memory Match | `/game/memory-match` | Flip cards to find matching pairs |
| Jigsaw Puzzle | `/game/jigsaw-puzzle` | Drag-and-drop pieces with snap-to-grid |
| Sudoku | `/game/sudoku` | 9×9 grid with hints & 3 difficulty levels |

### Word & Language
| Game | Route | Description |
|---|---|---|
| Wordle Clone | `/game/wordle-clone` | Guess the 5-letter word in 6 tries |
| Crossword | `/game/crossword` | Fill the grid using across/down clues |
| Word Search | `/game/word-search` | Find hidden words in a letter grid |
| Anagram Solver | `/game/anagram-solver` | Unscramble letters with streak bonuses |

### Logic & Strategy
| Game | Route | Description |
|---|---|---|
| Minesweeper | `/game/minesweeper` | Avoid mines using number logic |
| Tower of Hanoi | `/game/tower-of-hanoi` | Move disks with click-to-place mechanics |
| 2048 | `/game/2048` | Merge tiles to reach 2048 (arrow keys + swipe) |
| Nonogram | `/game/nonogram` | Fill grid cells from row/column clues |

### Multiplayer / Real-Time
| Game | Route | Description |
|---|---|---|
| Trivia Quiz | `/game/trivia-quiz` | 10-question quiz with timer & streak bonus |
| Draw & Guess | `/game/draw-and-guess` | Canvas drawing + word guessing |
| Chess | `/game/chess` | Full rules, legal move validation |
| Multiplayer Snake | `/game/multiplayer-snake` | 2-player local (Arrows vs WASD) |

## 🛠️ Tech Stack

- **React 18** — UI components & hooks
- **Vite** — fast dev server & bundling
- **React Router v6** — per-game routing
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icon library

## 📁 Project Structure

```
src/
├── pages/
│   ├── Dashboard.jsx        # Game selection home
│   ├── GameSelection.jsx    # Single/multiplayer mode picker
│   ├── GameRoom.jsx         # Game room
│   └── games/               # One file per game (16 total)
├── App.jsx                  # Routes
└── App.css
```

## 📜 License

MIT
