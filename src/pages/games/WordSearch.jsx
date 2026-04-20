import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock } from 'lucide-react';

// ── Puzzle config ─────────────────────────────────────────────────────────────
const ROWS = 10, COLS = 10;
const WORD_LIST = ['REACT', 'ARRAY', 'STATE', 'ASYNC', 'EVENT', 'SCOPE', 'CLASS', 'PROPS', 'HOOKS', 'REDUX'];

const place = (grid, word) => {
    const tries = 200;
    for (let t = 0; t < tries; t++) {
        const dir = Math.random() < 0.5 ? 'h' : 'v';
        const r = Math.floor(Math.random() * (dir === 'v' ? ROWS - word.length : ROWS));
        const c = Math.floor(Math.random() * (dir === 'h' ? COLS - word.length : COLS));
        let ok = true;
        for (let i = 0; i < word.length; i++) {
            const nr = dir === 'v' ? r + i : r;
            const nc = dir === 'h' ? c + i : c;
            if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) { ok = false; break; }
        }
        if (ok) {
            const g = grid.map((row) => [...row]);
            for (let i = 0; i < word.length; i++) {
                const nr = dir === 'v' ? r + i : r;
                const nc = dir === 'h' ? c + i : c;
                g[nr][nc] = word[i];
            }
            return { grid: g, entry: { word, r, c, dir } };
        }
    }
    return null;
};

const buildPuzzle = () => {
    let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    const entries = [];
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const word of WORD_LIST) {
        const res = place(grid, word);
        if (res) { grid = res.grid; entries.push(res.entry); }
    }
    // fill blanks
    const filled = grid.map((row) => row.map((c) => c === '' ? LETTERS[Math.floor(Math.random() * 26)] : c));
    return { grid: filled, entries };
};

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const WordSearch = () => {
    const navigate = useNavigate();
    const [{ grid, entries }, setPuzzle] = useState(buildPuzzle);
    const [selecting, setSelecting] = useState(false);
    const [startCell, setStartCell] = useState(null);
    const [endCell, setEndCell] = useState(null);
    const [found, setFound] = useState([]);
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [won, setWon] = useState(false);

    useEffect(() => {
        if (running) {
            const id = setInterval(() => setSeconds((s) => s + 1), 1000);
            return () => clearInterval(id);
        }
    }, [running]);

    const startNew = () => {
        setPuzzle(buildPuzzle());
        setSelecting(false); setStartCell(null); setEndCell(null);
        setFound([]); setSeconds(0); setRunning(false); setWon(false);
    };

    const getSelected = useCallback(() => {
        if (!startCell || !endCell) return new Set();
        const cells = new Set();
        const dr = Math.sign(endCell.r - startCell.r);
        const dc = Math.sign(endCell.c - startCell.c);
        let r = startCell.r, c = startCell.c;
        while (true) {
            cells.add(`${r},${c}`);
            if (r === endCell.r && c === endCell.c) break;
            r += dr; c += dc;
        }
        return cells;
    }, [startCell, endCell]);

    const checkWord = useCallback(() => {
        if (!startCell || !endCell) return;
        const dr = endCell.r - startCell.r;
        const dc = endCell.c - startCell.c;
        const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
        let word = '';
        const dirR = Math.sign(dr), dirC = Math.sign(dc);
        for (let i = 0; i < len; i++) word += grid[startCell.r + i * dirR]?.[startCell.c + i * dirC] ?? '';
        const match = entries.find(e => !found.includes(e.word) && (e.word === word || e.word === [...word].reverse().join('')));
        if (match) {
            const newFound = [...found, match.word];
            setFound(newFound);
            if (newFound.length === entries.length) { setRunning(false); setWon(true); }
        }
    }, [startCell, endCell, grid, entries, found]);

    const selectedCells = getSelected();

    const isFoundCell = (r, c) =>
        found.some((w) => {
            const e = entries.find((en) => en.word === w);
            if (!e) return false;
            return [...Array(e.word.length)].some((_, i) => {
                const nr = e.dir === 'v' ? e.r + i : e.r;
                const nc = e.dir === 'h' ? e.c + i : e.c;
                return nr === r && nc === c;
            });
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>
                <div className="text-center mb-4">
                    <div className="text-5xl mb-2">🔍</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Word Search</h1>
                    <p className="text-gray-400 text-sm">Find all {entries.length} hidden words — click & drag to select</p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-5">
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                        <Clock className="w-4 h-4 text-purple-300" />
                        <span className="text-white font-mono font-bold">{fmt(seconds)}</span>
                    </div>
                    <div className="bg-white/10 rounded-xl px-4 py-2 text-white font-bold">{found.length} / {entries.length}</div>
                    <button onClick={startNew} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105">
                        <RotateCcw className="w-4 h-4" /> New
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                    {/* Grid */}
                    <div
                        className="grid gap-0.5 select-none"
                        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: 'min(340px, 85vw)' }}
                        onMouseLeave={() => { if (selecting) { checkWord(); setSelecting(false); setStartCell(null); setEndCell(null); } }}
                    >
                        {grid.map((row, r) =>
                            row.map((ch, c) => {
                                const key = `${r},${c}`;
                                const isSel = selectedCells.has(key);
                                const isFound = isFoundCell(r, c);
                                return (
                                    <div
                                        key={key}
                                        className={`aspect-square rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-colors
                      ${isFound ? 'bg-green-500/70 text-white' : isSel ? 'bg-yellow-400/70 text-purple-900' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
                                        onMouseDown={() => { if (!running) setRunning(true); setSelecting(true); setStartCell({ r, c }); setEndCell({ r, c }); }}
                                        onMouseEnter={() => { if (selecting) setEndCell({ r, c }); }}
                                        onMouseUp={() => { checkWord(); setSelecting(false); setStartCell(null); setEndCell(null); }}
                                    >
                                        {ch}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Word list */}
                    <div>
                        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">Words</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {entries.map((e) => (
                                <span key={e.word} className={`text-sm font-mono font-semibold ${found.includes(e.word) ? 'line-through text-green-400' : 'text-gray-300'}`}>
                                    {e.word}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {won && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">All Words Found!</h2>
                        <p className="text-gray-300 mb-6">Time: <span className="text-yellow-400 font-bold">{fmt(seconds)}</span></p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={startNew} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"><RotateCcw className="w-4 h-4" /> Play Again</button>
                            <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"><ArrowLeft className="w-4 h-4" /> Dashboard</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WordSearch;
