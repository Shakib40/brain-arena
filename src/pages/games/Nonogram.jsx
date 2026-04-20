import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Lightbulb } from 'lucide-react';

// 5×5 nonogram
const PUZZLE = {
    solution: [
        [1, 0, 1, 0, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
    ],
};

const getClues = (lines) =>
    lines.map((line) => {
        const clues = [];
        let cnt = 0;
        for (const v of line) {
            if (v) cnt++;
            else if (cnt) { clues.push(cnt); cnt = 0; }
        }
        if (cnt) clues.push(cnt);
        return clues.length ? clues : [0];
    });

const ROWS = PUZZLE.solution.length;
const COLS = PUZZLE.solution[0].length;
const ROW_CLUES = getClues(PUZZLE.solution);
const COL_CLUES = getClues(Array.from({ length: COLS }, (_, c) => PUZZLE.solution.map((r) => r[c])));

const Nonogram = () => {
    const navigate = useNavigate();
    const [grid, setGrid] = useState(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(0))); // 0=empty,1=filled,2=crossed
    const [won, setWon] = useState(false);
    const [hints, setHints] = useState(3);

    const startNew = () => { setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(0))); setWon(false); setHints(3); };

    const toggle = useCallback((r, c, rightClick) => {
        if (won) return;
        setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            if (rightClick) next[r][c] = next[r][c] === 2 ? 0 : 2;
            else next[r][c] = next[r][c] === 1 ? 0 : 1;
            // win check
            const solved = PUZZLE.solution.every((row, ri) => row.every((v, ci) => (v === 1) === (next[ri][ci] === 1)));
            if (solved) setWon(true);
            return next;
        });
    }, [won]);

    const useHint = () => {
        if (hints === 0 || won) return;
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (grid[r][c] !== 1 && PUZZLE.solution[r][c] === 1) {
                setGrid((prev) => { const next = prev.map((row) => [...row]); next[r][c] = 1; return next; });
                setHints((h) => h - 1);
                return;
            }
        }
    };

    const isRowCorrect = (r) => PUZZLE.solution[r].every((v, c) => (v === 1) === (grid[r][c] === 1));
    const isColCorrect = (c) => PUZZLE.solution.every((row, r) => (row[c] === 1) === (grid[r][c] === 1));

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="container mx-auto px-4 py-6 max-w-lg">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center mb-5">
                    <div className="text-5xl mb-2">🖼️</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Nonogram</h1>
                    <p className="text-gray-400 text-sm">Left-click to fill • Right-click to mark ✗ • Use the clues</p>
                </div>

                <div className="flex justify-center gap-3 mb-5">
                    <button onClick={useHint} disabled={hints === 0 || won} className={`flex items-center gap-1.5 font-semibold text-sm px-4 py-2 rounded-xl transition-all hover:scale-105 ${hints > 0 && !won ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}>
                        <Lightbulb className="w-4 h-4" /> Hints ({hints})
                    </button>
                    <button onClick={startNew} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                </div>

                <div className="flex justify-center">
                    <div className="inline-block">
                        {/* Column clues */}
                        <div className="flex mb-0.5">
                            <div style={{ width: 56 }} />
                            {COL_CLUES.map((clue, c) => (
                                <div key={c} className={`flex flex-col items-center justify-end text-xs font-bold pb-1 ${isColCorrect(c) ? 'text-green-400' : 'text-purple-300'}`}
                                    style={{ width: 44 }}>
                                    {clue.map((n, i) => <span key={i}>{n}</span>)}
                                </div>
                            ))}
                        </div>

                        {/* Grid rows */}
                        {Array.from({ length: ROWS }, (_, r) => (
                            <div key={r} className="flex items-center mb-0.5">
                                {/* Row clue */}
                                <div className={`flex items-center justify-end gap-1 pr-2 text-xs font-bold ${isRowCorrect(r) ? 'text-green-400' : 'text-purple-300'}`} style={{ width: 56, minWidth: 56 }}>
                                    {ROW_CLUES[r].map((n, i) => <span key={i}>{n}</span>)}
                                </div>
                                {/* Cells */}
                                {Array.from({ length: COLS }, (_, c) => (
                                    <div
                                        key={c}
                                        onClick={() => toggle(r, c, false)}
                                        onContextMenu={(e) => { e.preventDefault(); toggle(r, c, true); }}
                                        className={`w-11 h-11 rounded-lg flex items-center justify-center text-base font-bold cursor-pointer select-none transition-all hover:scale-105 border-2 ${grid[r][c] === 1 ? 'bg-purple-500 border-purple-400 text-white' :
                                                grid[r][c] === 2 ? 'bg-white/5 border-white/20 text-red-400' :
                                                    'bg-white/10 border-white/10 hover:bg-white/20'
                                            }`}
                                        style={{ marginRight: (c + 1) % 5 === 0 ? 0 : 2 }}
                                    >
                                        {grid[r][c] === 2 ? '✗' : ''}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {won && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-4">Puzzle Complete! 🖼️</h2>
                        <div className="flex gap-4 justify-center">
                            <button onClick={startNew} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"><RotateCcw className="w-4 h-4" />Play Again</button>
                            <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"><ArrowLeft className="w-4 h-4" />Dashboard</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Nonogram;
