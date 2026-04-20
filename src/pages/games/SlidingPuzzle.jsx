import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock, Move } from 'lucide-react';

const SIZE = 4;
const SOLVED = [...Array(SIZE * SIZE - 1).keys()].map((n) => n + 1).concat(0);

// ── helpers ──────────────────────────────────────────────────────────────────
const isSolvable = (tiles) => {
    const flat = tiles.filter((t) => t !== 0);
    let inversions = 0;
    for (let i = 0; i < flat.length; i++)
        for (let j = i + 1; j < flat.length; j++)
            if (flat[i] > flat[j]) inversions++;
    const blankRow = Math.floor(tiles.indexOf(0) / SIZE);
    const blankFromBottom = SIZE - blankRow;
    if (SIZE % 2 === 1) return inversions % 2 === 0;
    if (blankFromBottom % 2 === 0) return inversions % 2 === 1;
    return inversions % 2 === 0;
};

const shuffle = () => {
    let tiles;
    do {
        tiles = [...SOLVED].sort(() => Math.random() - 0.5);
    } while (!isSolvable(tiles) || tiles.join() === SOLVED.join());
    return tiles;
};

const isSolved = (tiles) => tiles.join() === SOLVED.join();

const getNeighbours = (idx) => {
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    const nb = [];
    if (row > 0) nb.push(idx - SIZE);
    if (row < SIZE - 1) nb.push(idx + SIZE);
    if (col > 0) nb.push(idx - 1);
    if (col < SIZE - 1) nb.push(idx + 1);
    return nb;
};

const fmt = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
};

// ── component ─────────────────────────────────────────────────────────────────
const SlidingPuzzle = () => {
    const navigate = useNavigate();
    const [tiles, setTiles] = useState(() => shuffle());
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [won, setWon] = useState(false);
    const [bestMoves, setBestMoves] = useState(null);
    const [bestTime, setBestTime] = useState(null);
    const intervalRef = useRef(null);

    // timer
    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running]);

    const startNew = useCallback(() => {
        setTiles(shuffle());
        setMoves(0);
        setSeconds(0);
        setRunning(false);
        setWon(false);
    }, []);

    const moveTile = useCallback(
        (idx) => {
            if (won) return;
            const blankIdx = tiles.indexOf(0);
            if (!getNeighbours(blankIdx).includes(idx)) return;

            if (!running) setRunning(true);

            setTiles((prev) => {
                const next = [...prev];
                [next[blankIdx], next[idx]] = [next[idx], next[blankIdx]];
                return next;
            });
            setMoves((m) => {
                const newM = m + 1;
                return newM;
            });
        },
        [tiles, won, running]
    );

    // win detection
    useEffect(() => {
        if (isSolved(tiles) && moves > 0) {
            setRunning(false);
            setWon(true);
            setBestMoves((prev) => (prev === null || moves < prev ? moves : prev));
            setBestTime((prev) => (prev === null || seconds < prev ? seconds : prev));
        }
    }, [tiles, moves, seconds]);

    // keyboard support
    useEffect(() => {
        const handleKey = (e) => {
            const blankIdx = tiles.indexOf(0);
            const row = Math.floor(blankIdx / SIZE);
            const col = blankIdx % SIZE;
            let target = -1;
            if (e.key === 'ArrowUp' && row < SIZE - 1) target = blankIdx + SIZE;
            if (e.key === 'ArrowDown' && row > 0) target = blankIdx - SIZE;
            if (e.key === 'ArrowLeft' && col < SIZE - 1) target = blankIdx + 1;
            if (e.key === 'ArrowRight' && col > 0) target = blankIdx - 1;
            if (target !== -1) { e.preventDefault(); moveTile(target); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [tiles, moveTile]);

    const blankIdx = tiles.indexOf(0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🧩</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Sliding Puzzle</h1>
                    <p className="text-gray-400 text-sm">Arrange tiles 1–15 in order • Use arrow keys or click</p>
                </div>

                {/* Stats bar */}
                <div className="flex justify-center gap-6 mb-8">
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-6 py-3 backdrop-blur">
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                            <Clock className="w-3 h-3" /> TIME
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">{fmt(seconds)}</span>
                        {bestTime !== null && (
                            <span className="text-xs text-yellow-400">Best {fmt(bestTime)}</span>
                        )}
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-6 py-3 backdrop-blur">
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                            <Move className="w-3 h-3" /> MOVES
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">{moves}</span>
                        {bestMoves !== null && (
                            <span className="text-xs text-yellow-400">Best {bestMoves}</span>
                        )}
                    </div>
                </div>

                {/* Board */}
                <div className="flex justify-center mb-8">
                    <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, width: 'min(420px, 90vw)' }}
                    >
                        {tiles.map((tile, idx) => {
                            const isBlank = tile === 0;
                            const isMovable = !isBlank && getNeighbours(blankIdx).includes(idx);
                            const isCorrect = tile !== 0 && tile === idx + 1;

                            return (
                                <div
                                    key={tile === 0 ? 'blank' : tile}
                                    onClick={() => moveTile(idx)}
                                    className={[
                                        'aspect-square rounded-xl font-bold text-xl flex items-center justify-center select-none transition-all duration-150',
                                        isBlank
                                            ? 'bg-transparent cursor-default'
                                            : isMovable
                                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40 active:scale-95'
                                                : isCorrect
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white cursor-pointer hover:scale-105'
                                                    : 'bg-gradient-to-br from-purple-700 to-indigo-800 text-white cursor-pointer hover:scale-105',
                                    ].join(' ')}
                                >
                                    {!isBlank && tile}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* New Game button */}
                <div className="flex justify-center">
                    <button
                        onClick={startNew}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-700/40"
                    >
                        <RotateCcw className="w-5 h-5" /> New Game
                    </button>
                </div>
            </div>

            {/* Win overlay */}
            {won && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl shadow-purple-900/60 max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Puzzle Solved!</h2>
                        <p className="text-gray-300 mb-6">
                            Completed in <span className="text-yellow-400 font-semibold">{moves} moves</span> &
                            <span className="text-yellow-400 font-semibold"> {fmt(seconds)}</span>
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={startNew}
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

export default SlidingPuzzle;
