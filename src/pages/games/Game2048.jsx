import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

const SIZE = 4;
const EMPTY = 0;

const initBoard = () => Array(SIZE).fill(null).map(() => Array(SIZE).fill(EMPTY));

const addTile = (board) => {
    const empties = [];
    board.forEach((row, r) => row.forEach((v, c) => { if (!v) empties.push([r, c]); }));
    if (!empties.length) return board;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const next = board.map((row) => [...row]);
    next[r][c] = Math.random() < 0.9 ? 2 : 4;
    return next;
};

const startBoard = () => addTile(addTile(initBoard()));

const slide = (row) => {
    const nums = row.filter(Boolean);
    const merged = [];
    let i = 0, score = 0;
    while (i < nums.length) {
        if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
            merged.push(nums[i] * 2);
            score += nums[i] * 2;
            i += 2;
        } else { merged.push(nums[i]); i++; }
    }
    while (merged.length < SIZE) merged.push(0);
    return { row: merged, score };
};

const move = (board, dir) => {
    let next = board.map((r) => [...r]);
    let total = 0, changed = false;

    const slideRow = (row) => { const s = slide(row); total += s.score; return s.row; };

    if (dir === 'left') {
        next = next.map((row) => { const s = slideRow(row); if (s.join() !== row.join()) changed = true; return s; });
    } else if (dir === 'right') {
        next = next.map((row) => { const rev = [...row].reverse(); const s = slideRow(rev); const res = s.reverse(); if (res.join() !== row.join()) changed = true; return res; });
    } else if (dir === 'up') {
        for (let c = 0; c < SIZE; c++) {
            const col = next.map((r) => r[c]);
            const s = slideRow(col);
            s.forEach((v, r) => { if (v !== next[r][c]) changed = true; next[r][c] = v; });
        }
    } else if (dir === 'down') {
        for (let c = 0; c < SIZE; c++) {
            const col = next.map((r) => r[c]).reverse();
            const s = slideRow(col).reverse();
            s.forEach((v, r) => { if (v !== next[r][c]) changed = true; next[r][c] = v; });
        }
    }
    return { next: changed ? addTile(next) : next, score: total, changed };
};

const canMove = (board) => {
    for (const dir of ['left', 'right', 'up', 'down']) {
        if (move(board, dir).changed) return true;
    }
    return false;
};

const TILE_STYLES = {
    0: 'bg-white/5 text-transparent',
    2: 'bg-amber-100 text-gray-900',
    4: 'bg-amber-200 text-gray-900',
    8: 'bg-orange-400 text-white',
    16: 'bg-orange-500 text-white',
    32: 'bg-red-500 text-white',
    64: 'bg-red-600 text-white',
    128: 'bg-yellow-400 text-white',
    256: 'bg-yellow-500 text-white',
    512: 'bg-lime-500 text-white',
    1024: 'bg-green-500 text-white',
    2048: 'bg-gradient-to-br from-yellow-300 to-orange-400 text-white',
};
const getTile = (v) => TILE_STYLES[v] || 'bg-purple-600 text-white';

const Game2048 = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState(startBoard);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [over, setOver] = useState(false);
    const [won, setWon] = useState(false);
    const [continued, setContinued] = useState(false);

    const startNew = () => { setBoard(startBoard()); setScore(0); setOver(false); setWon(false); setContinued(false); };

    const doMove = useCallback((dir) => {
        if (over) return;
        setBoard((prev) => {
            const result = move(prev, dir);
            if (!result.changed) return prev;
            setScore((s) => {
                const ns = s + result.score;
                setBest((b) => Math.max(b, ns));
                return ns;
            });
            if (!won && result.next.some((r) => r.includes(2048))) { setWon(true); }
            if (!canMove(result.next)) setOver(true);
            return result.next;
        });
    }, [over, won]);

    useEffect(() => {
        const handler = (e) => {
            const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
            if (map[e.key]) { e.preventDefault(); doMove(map[e.key]); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [doMove]);

    // touch swipe
    useEffect(() => {
        let sx = 0, sy = 0;
        const ts = (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
        const te = (e) => {
            const dx = e.changedTouches[0].clientX - sx;
            const dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
            else doMove(dy > 0 ? 'down' : 'up');
        };
        window.addEventListener('touchstart', ts, { passive: true });
        window.addEventListener('touchend', te, { passive: true });
        return () => { window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te); };
    }, [doMove]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="container mx-auto px-4 py-6 max-w-md">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center mb-5">
                    <div className="text-5xl mb-2">📊</div>
                    <h1 className="text-4xl font-bold text-white mb-1">2048</h1>
                    <p className="text-gray-400 text-sm">Use arrow keys or swipe to merge tiles • Reach 2048!</p>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-3">
                        <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                            <div className="text-xs text-purple-300">SCORE</div>
                            <div className="text-xl font-bold text-white">{score}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                            <div className="text-xs text-yellow-300">BEST</div>
                            <div className="text-xl font-bold text-white">{best}</div>
                        </div>
                    </div>
                    <button onClick={startNew} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105">
                        <RotateCcw className="w-4 h-4" /> New
                    </button>
                </div>

                <div className="bg-purple-800/50 p-2 rounded-2xl shadow-2xl border border-purple-600/40">
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
                        {board.flat().map((v, i) => (
                            <div key={i} className={`aspect-square rounded-xl flex items-center justify-center font-bold transition-all duration-100 ${getTile(v)} ${v >= 1000 ? 'text-sm' : v >= 100 ? 'text-base' : 'text-xl'}`}>
                                {v || ''}
                            </div>
                        ))}
                    </div>
                </div>

                {over && (
                    <div className="mt-5 text-center">
                        <p className="text-red-400 font-bold text-lg mb-3">Game Over!</p>
                        <button onClick={startNew} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl mx-auto transition-all hover:scale-105"><RotateCcw className="w-4 h-4" />Play Again</button>
                    </div>
                )}
            </div>

            {won && !continued && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-yellow-700 to-orange-700 rounded-2xl p-10 text-center border border-yellow-400 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">You reached 2048!</h2>
                        <p className="text-yellow-100 mb-6">Score: <span className="font-bold text-2xl">{score}</span></p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setContinued(true)} className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105">Keep Going</button>
                            <button onClick={startNew} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"><RotateCcw className="w-4 h-4" />New Game</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game2048;
