import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock, Lightbulb, CheckCircle } from 'lucide-react';

// ── Sudoku generator (backtracking) ──────────────────────────────────────────
const isValid = (board, row, col, num) => {
    for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
    for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
        for (let c = bc; c < bc + 3; c++)
            if (board[r][c] === num) return false;
    return true;
};

const fillBoard = (board) => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (const n of nums) {
                    if (isValid(board, r, c, n)) {
                        board[r][c] = n;
                        if (fillBoard(board)) return true;
                        board[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

const CLUES = { easy: 36, medium: 28, hard: 20 };

const generatePuzzle = (difficulty = 'medium') => {
    // create solved board
    const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillBoard(solution);

    // remove cells
    const puzzle = solution.map((r) => [...r]);
    let toRemove = 81 - CLUES[difficulty];
    const positions = [...Array(81).keys()].sort(() => Math.random() - 0.5);
    for (let i = 0; i < toRemove; i++) {
        const pos = positions[i];
        puzzle[Math.floor(pos / 9)][pos % 9] = 0;
    }

    return { puzzle, solution };
};

const fmt = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    return `${m}:${String(s % 60).padStart(2, '0')}`;
};

// ── Conflict detection ────────────────────────────────────────────────────────
const hasConflict = (board, row, col, val) => {
    if (!val) return false;
    for (let c = 0; c < 9; c++) if (c !== col && board[row][c] === val) return true;
    for (let r = 0; r < 9; r++) if (r !== row && board[r][col] === val) return true;
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
        for (let c = bc; c < bc + 3; c++)
            if ((r !== row || c !== col) && board[r][c] === val) return true;
    return false;
};

// ── Component ─────────────────────────────────────────────────────────────────
const Sudoku = () => {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState('medium');
    const [{ puzzle, solution }, setPuzzleData] = useState(() => generatePuzzle('medium'));
    const [board, setBoard] = useState(() => puzzle.map((r) => [...r]));
    const [given, setGiven] = useState(() => puzzle.map((r) => r.map((v) => v !== 0)));
    const [selected, setSelected] = useState(null); // [row, col]
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [won, setWon] = useState(false);
    const [hints, setHints] = useState(3);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        } else clearInterval(intervalRef.current);
        return () => clearInterval(intervalRef.current);
    }, [running]);

    const newGame = useCallback((diff = difficulty) => {
        const data = generatePuzzle(diff);
        setPuzzleData(data);
        setBoard(data.puzzle.map((r) => [...r]));
        setGiven(data.puzzle.map((r) => r.map((v) => v !== 0)));
        setSelected(null);
        setSeconds(0);
        setRunning(false);
        setWon(false);
        setHints(3);
    }, [difficulty]);

    const enterNumber = useCallback((num) => {
        if (!selected || won) return;
        const [row, col] = selected;
        if (given[row][col]) return;
        if (!running) setRunning(true);
        setBoard((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] = num;
            // win check
            const complete = next.every((r, ri) =>
                r.every((v, ci) => v !== 0 && !hasConflict(next, ri, ci, v))
            );
            if (complete) { setRunning(false); setWon(true); }
            return next;
        });
    }, [selected, given, won, running]);

    const useHint = useCallback(() => {
        if (hints === 0 || won) return;
        // find first wrong/empty editable cell
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!given[r][c] && board[r][c] !== solution[r][c]) {
                    if (!running) setRunning(true);
                    setBoard((prev) => {
                        const next = prev.map((row) => [...row]);
                        next[r][c] = solution[r][c];
                        return next;
                    });
                    setHints((h) => h - 1);
                    setSelected([r, c]);
                    return;
                }
            }
        }
    }, [board, given, hints, solution, won, running]);

    // keyboard
    useEffect(() => {
        const handler = (e) => {
            if (e.key >= '1' && e.key <= '9') enterNumber(Number(e.key));
            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') enterNumber(0);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [enterNumber]);

    const selRow = selected?.[0];
    const selCol = selected?.[1];
    const selBox = selected ? `${Math.floor(selRow / 3)},${Math.floor(selCol / 3)}` : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            <div className="container mx-auto px-4 py-6 max-w-xl">
                {/* Back */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                {/* Title */}
                <div className="text-center mb-4">
                    <div className="text-5xl mb-2">📝</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Sudoku</h1>
                    <p className="text-gray-400 text-sm">Fill every row, column & box with 1–9</p>
                </div>

                {/* Difficulty picker */}
                <div className="flex justify-center gap-2 mb-5">
                    {['easy', 'medium', 'hard'].map((d) => (
                        <button
                            key={d}
                            onClick={() => { setDifficulty(d); newGame(d); }}
                            className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all ${difficulty === d
                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-700/40'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {/* Stats row */}
                <div className="flex justify-center gap-4 mb-5">
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 backdrop-blur">
                        <Clock className="w-4 h-4 text-purple-300" />
                        <span className="text-white font-mono font-bold">{fmt(seconds)}</span>
                    </div>
                    <button
                        onClick={useHint}
                        disabled={hints === 0 || won}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-sm transition-all ${hints > 0 && !won
                                ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                                : 'bg-white/5 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Lightbulb className="w-4 h-4" />
                        Hints ({hints})
                    </button>
                    <button
                        onClick={() => newGame()}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl px-4 py-2 text-sm transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        New
                    </button>
                </div>

                {/* Board */}
                <div className="flex justify-center mb-5">
                    <div
                        className="grid border-2 border-purple-400 rounded-xl overflow-hidden shadow-2xl shadow-purple-900/60"
                        style={{ gridTemplateColumns: 'repeat(9, 1fr)', width: 'min(378px, 88vw)' }}
                    >
                        {board.map((row, r) =>
                            row.map((val, c) => {
                                const isGiven = given[r][c];
                                const isSel = selRow === r && selCol === c;
                                const isSameRow = selRow === r;
                                const isSameCol = selCol === c;
                                const isSameBox = selBox === `${Math.floor(r / 3)},${Math.floor(c / 3)}`;
                                const isSameNum = val && val === board[selRow]?.[selCol];
                                const conflict = hasConflict(board, r, c, val);
                                const isWrong = !isGiven && val !== 0 && val !== solution[r][c];

                                const rightBorder = (c + 1) % 3 === 0 && c !== 8;
                                const bottomBorder = (r + 1) % 3 === 0 && r !== 8;

                                let bg = 'bg-white/5';
                                if (isSel) bg = 'bg-purple-500/60';
                                else if (isSameNum) bg = 'bg-purple-400/25';
                                else if (isSameRow || isSameCol || isSameBox) bg = 'bg-white/10';

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => setSelected([r, c])}
                                        className={`
                      flex items-center justify-center cursor-pointer select-none
                      transition-colors duration-100 aspect-square text-sm font-bold
                      ${bg}
                      ${rightBorder ? 'border-r-2 border-r-purple-400' : 'border-r border-r-white/10'}
                      ${bottomBorder ? 'border-b-2 border-b-purple-400' : 'border-b border-b-white/10'}
                      ${isGiven ? 'text-white' : conflict || isWrong ? 'text-red-400' : 'text-purple-300'}
                    `}
                                    >
                                        {val !== 0 ? val : ''}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Number pad */}
                <div className="flex justify-center gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <button
                            key={n}
                            onClick={() => enterNumber(n)}
                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-700 to-indigo-700 text-white font-bold hover:from-purple-500 hover:to-indigo-500 hover:scale-110 active:scale-95 transition-all shadow-md"
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        onClick={() => enterNumber(0)}
                        className="w-10 h-10 rounded-lg bg-white/10 text-gray-300 font-bold hover:bg-white/20 hover:scale-110 active:scale-95 transition-all"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Win overlay */}
            {won && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Puzzle Solved!</h2>
                        <p className="text-gray-300 mb-6">
                            Completed in <span className="text-yellow-400 font-semibold">{fmt(seconds)}</span> on{' '}
                            <span className="text-yellow-400 font-semibold capitalize">{difficulty}</span>
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => newGame()}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
                            >
                                <RotateCcw className="w-4 h-4" /> Play Again
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
                            >
                                <ArrowLeft className="w-4 h-4" /> Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sudoku;
