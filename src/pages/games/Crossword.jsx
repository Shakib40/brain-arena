import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, CheckCircle } from 'lucide-react';

// ── Puzzle definition ─────────────────────────────────────────────────────────
const PUZZLE = {
    size: 11,
    answers: [
        { word: 'REACT', row: 0, col: 0, dir: 'across', clue: '1A. Popular JS UI library' },
        { word: 'ROUTE', row: 0, col: 0, dir: 'down', clue: '1D. URL path in a web app' },
        { word: 'CODE', row: 0, col: 2, dir: 'down', clue: '2D. Instructions for a computer' },
        { word: 'ARRAY', row: 2, col: 0, dir: 'across', clue: '3A. Ordered list of elements' },
        { word: 'ASYNC', row: 4, col: 0, dir: 'across', clue: '4A. Non-blocking JS keyword' },
        { word: 'EVENT', row: 4, col: 0, dir: 'down', clue: '4D. User action or browser signal' },
        { word: 'NODE', row: 4, col: 2, dir: 'down', clue: '5D. JS runtime environment' },
        { word: 'YIELD', row: 6, col: 0, dir: 'across', clue: '6A. Generator function keyword' },
        { word: 'STATE', row: 8, col: 0, dir: 'across', clue: '7A. React component data store' },
    ],
};

const buildGrid = () => {
    const grid = Array.from({ length: PUZZLE.size }, () => Array(PUZZLE.size).fill(null));
    PUZZLE.answers.forEach(({ word, row, col, dir }) => {
        [...word].forEach((ch, i) => {
            const r = dir === 'across' ? row : row + i;
            const c = dir === 'across' ? col + i : col;
            if (r < PUZZLE.size && c < PUZZLE.size) grid[r][c] = ch;
        });
    });
    return grid;
};

const SOLUTION = buildGrid();

const emptyUserGrid = () =>
    Array.from({ length: PUZZLE.size }, () => Array(PUZZLE.size).fill(''));

const Crossword = () => {
    const navigate = useNavigate();
    const [userGrid, setUserGrid] = useState(emptyUserGrid);
    const [selected, setSelected] = useState(null);
    const [won, setWon] = useState(false);
    const [moves, setMoves] = useState(0);
    const inputRefs = useRef({});

    const startNew = () => { setUserGrid(emptyUserGrid()); setSelected(null); setWon(false); setMoves(0); };

    const revealAll = () => {
        setUserGrid(SOLUTION.map((r) => r.map((c) => c ?? '')));
        setWon(true);
    };

    const handleInput = useCallback((r, c, val) => {
        const ch = val.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
        setUserGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[r][c] = ch;
            const solved = SOLUTION.every((row, ri) =>
                row.every((cell, ci) => cell === null || next[ri][ci] === cell)
            );
            if (solved && !won) setWon(true);
            return next;
        });
        setMoves((m) => m + 1);
        // move focus right or down
        const tries = [[r, c + 1], [r + 1, c]];
        for (const [nr, nc] of tries) {
            if (SOLUTION[nr]?.[nc] !== null && SOLUTION[nr]?.[nc] !== undefined) {
                inputRefs.current[`${nr}-${nc}`]?.focus();
                break;
            }
        }
    }, [won]);

    const getCellStatus = (r, c) => {
        if (SOLUTION[r][c] === null) return null;
        if (!userGrid[r][c]) return 'empty';
        return userGrid[r][c] === SOLUTION[r][c] ? 'correct' : 'wrong';
    };

    const statusStyle = { correct: 'bg-green-600 text-white', wrong: 'bg-red-500 text-white', empty: 'bg-white/10 text-white' };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">📰</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Crossword</h1>
                    <p className="text-gray-400 text-sm">Fill in all the answers using the clues below</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                    {/* Grid */}
                    <div className="overflow-auto">
                        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${PUZZLE.size}, 1fr)`, width: 'min(400px, 90vw)' }}>
                            {SOLUTION.map((row, r) =>
                                row.map((cell, c) => {
                                    if (cell === null) return <div key={`${r}-${c}`} className="aspect-square bg-purple-950/80 rounded-sm" />;
                                    const status = getCellStatus(r, c);
                                    return (
                                        <div key={`${r}-${c}`} className={`aspect-square rounded-sm flex items-center justify-center text-xs font-bold ${statusStyle[status]}`}>
                                            <input
                                                ref={(el) => (inputRefs.current[`${r}-${c}`] = el)}
                                                maxLength={1}
                                                value={userGrid[r][c]}
                                                onClick={() => setSelected(`${r}-${c}`)}
                                                onChange={(e) => handleInput(r, c, e.target.value)}
                                                className="w-full h-full text-center bg-transparent outline-none font-bold text-sm uppercase"
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Clues */}
                    <div className="flex-1 min-w-52">
                        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">Clues</h3>
                        <div className="space-y-1">
                            {PUZZLE.answers.map((a) => (
                                <p key={`${a.clue}`} className="text-gray-300 text-sm">{a.clue}</p>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-6 flex-wrap">
                            <button onClick={startNew} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105">
                                <RotateCcw className="w-4 h-4" /> Reset
                            </button>
                            <button onClick={revealAll} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105">
                                <CheckCircle className="w-4 h-4" /> Reveal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {won && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-4">Crossword Complete!</h2>
                        <div className="flex gap-4 justify-center">
                            <button onClick={startNew} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105">
                                <RotateCcw className="w-4 h-4" /> Play Again
                            </button>
                            <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105">
                                <ArrowLeft className="w-4 h-4" /> Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Crossword;
