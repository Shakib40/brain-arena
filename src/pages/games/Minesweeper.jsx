import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Flag, Clock } from 'lucide-react';

const ROWS = 9, COLS = 9, MINES = 10;

const createGrid = (firstR, firstC) => {
    const cells = Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => ({ r, c, mine: false, revealed: false, flagged: false, count: 0 }))
    );
    // place mines avoiding first click
    let placed = 0;
    while (placed < MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if (!cells[r][c].mine && !(r === firstR && c === firstC)) {
            cells[r][c].mine = true;
            placed++;
        }
    }
    // count neighbours
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (cells[r][c].mine) continue;
        let cnt = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            if (cells[r + dr]?.[c + dc]?.mine) cnt++;
        }
        cells[r][c].count = cnt;
    }
    return cells;
};

const reveal = (grid, r, c) => {
    const cell = grid[r]?.[c];
    if (!cell || cell.revealed || cell.flagged) return;
    cell.revealed = true;
    if (cell.count === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) reveal(grid, r + dr, c + dc);
    }
};

const COUNT_COLORS = ['', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-indigo-400', 'text-red-600', 'text-cyan-400', 'text-purple-400', 'text-gray-400'];
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const Minesweeper = () => {
    const navigate = useNavigate();
    const [grid, setGrid] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | playing | won | lost
    const [flags, setFlags] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (status === 'playing') {
            const id = setInterval(() => setSeconds((s) => s + 1), 1000);
            return () => clearInterval(id);
        }
    }, [status]);

    const startNew = () => { setGrid(null); setStatus('idle'); setFlags(0); setSeconds(0); };

    const handleClick = useCallback((r, c) => {
        if (status === 'won' || status === 'lost') return;
        let g;
        if (!grid) {
            g = createGrid(r, c);
            setStatus('playing');
            setSeconds(0);
        } else {
            g = grid.map((row) => row.map((cell) => ({ ...cell })));
        }
        if (g[r][c].flagged || g[r][c].revealed) return;
        if (g[r][c].mine) {
            // reveal all mines
            g.forEach((row) => row.forEach((cell) => { if (cell.mine) cell.revealed = true; }));
            setGrid(g); setStatus('lost'); return;
        }
        reveal(g, r, c);
        const won = g.every((row) => row.every((cell) => cell.mine || cell.revealed));
        setGrid(g);
        if (won) setStatus('won');
    }, [grid, status]);

    const handleRightClick = useCallback((e, r, c) => {
        e.preventDefault();
        if (!grid || status !== 'playing') return;
        const g = grid.map((row) => row.map((cell) => ({ ...cell })));
        if (g[r][c].revealed) return;
        g[r][c].flagged = !g[r][c].flagged;
        setFlags((f) => f + (g[r][c].flagged ? 1 : -1));
        setGrid(g);
    }, [grid, status]);

    const remaining = MINES - flags;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="container mx-auto px-4 py-6 max-w-lg">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center mb-5">
                    <div className="text-5xl mb-2">💣</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Minesweeper</h1>
                    <p className="text-gray-400 text-sm">Right-click to flag mines • Left-click to reveal</p>
                </div>

                <div className="flex justify-center gap-4 mb-4">
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                        <Clock className="w-4 h-4 text-purple-300" /><span className="text-white font-mono font-bold">{fmt(seconds)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                        <Flag className="w-4 h-4 text-red-400" /><span className="text-white font-bold">{remaining}</span>
                    </div>
                    <button onClick={startNew} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105">
                        <RotateCcw className="w-4 h-4" /> New
                    </button>
                </div>

                {status === 'idle' && (
                    <p className="text-center text-gray-400 mb-4 text-sm">Click any cell to start</p>
                )}

                <div className="flex justify-center mb-4">
                    <div className="grid gap-px bg-purple-600/30 rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl"
                        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: 'min(340px, 85vw)' }}>
                        {(grid || Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => ({ r, c, mine: false, revealed: false, flagged: false, count: 0 }))))
                            .flat().map((cell) => {
                                const { r, c, revealed, flagged, mine, count } = cell;
                                let content = '';
                                let cls = 'bg-white/10 hover:bg-white/20 cursor-pointer';
                                if (flagged && !revealed) { content = '🚩'; cls = 'bg-white/10 cursor-pointer'; }
                                else if (revealed && mine) { content = '💣'; cls = 'bg-red-600/80'; }
                                else if (revealed) { content = count > 0 ? count : ''; cls = `bg-white/5 ${COUNT_COLORS[count]}`; }
                                return (
                                    <div key={`${r}-${c}`}
                                        className={`aspect-square flex items-center justify-center text-xs font-bold select-none transition-colors ${cls}`}
                                        onClick={() => handleClick(r, c)}
                                        onContextMenu={(e) => handleRightClick(e, r, c)}>
                                        {content}
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {status === 'lost' && <p className="text-center text-red-400 font-bold text-lg">💥 Boom! Game Over</p>}
                {status === 'won' && <p className="text-center text-green-400 font-bold text-lg">🎉 You cleared the board!</p>}
            </div>

            {status === 'won' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Board Cleared!</h2>
                        <p className="text-gray-300 mb-6">Time: <span className="text-yellow-400 font-bold">{fmt(seconds)}</span></p>
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

export default Minesweeper;
