import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock, Move, Eye, EyeOff } from 'lucide-react';

// ── config ────────────────────────────────────────────────────────────────────
const COLS = 4;
const ROWS = 4;
const TOTAL = COLS * ROWS;

// A vibrant colour-gradient "image" split into tiles
// Each tile knows its palette position so together they look like one image
const PALETTE = [
    ['#f72585', '#b5179e', '#7209b7', '#560bad'],
    ['#480ca8', '#3a0ca3', '#3f37c9', '#4361ee'],
    ['#4895ef', '#4cc9f0', '#06d6a0', '#1b9aaa'],
    ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'],
];

const getTileStyle = (row, col) => ({
    background: `radial-gradient(ellipse at ${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%,
    ${PALETTE[row][col]} 0%,
    ${PALETTE[Math.min(row + 1, ROWS - 1)][Math.min(col + 1, COLS - 1)]} 100%)`,
});

const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const createBoard = () => shuffle([...Array(TOTAL).keys()]);

const fmt = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
};

// ── component ─────────────────────────────────────────────────────────────────
const JigsawPuzzle = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState(createBoard);   // board[pos] = pieceId
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [won, setWon] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [bestMoves, setBestMoves] = useState(null);
    const [bestTime, setBestTime] = useState(null);
    const dragFrom = useRef(null);
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
        setBoard(createBoard());
        setMoves(0);
        setSeconds(0);
        setRunning(false);
        setWon(false);
        setShowHint(false);
        dragFrom.current = null;
    }, []);

    const handleDragStart = (pos) => {
        dragFrom.current = pos;
    };

    const handleDrop = useCallback(
        (pos) => {
            if (dragFrom.current === null || dragFrom.current === pos || won) return;
            if (!running) setRunning(true);

            const from = dragFrom.current;
            dragFrom.current = null;

            setBoard((prev) => {
                const next = [...prev];
                [next[from], next[pos]] = [next[pos], next[from]];
                return next;
            });

            setMoves((m) => {
                const nm = m + 1;
                return nm;
            });
        },
        [running, won]
    );

    // win check
    useEffect(() => {
        if (board.every((piece, pos) => piece === pos) && moves > 0) {
            setRunning(false);
            setWon(true);
            setBestMoves((prev) => (prev === null || moves < prev ? moves : prev));
            setBestTime((prev) => (prev === null || seconds < prev ? seconds : prev));
        }
    }, [board, moves, seconds]);

    const solved = board.filter((p, i) => p === i).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                {/* Back */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                {/* Title */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🧩</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Jigsaw Puzzle</h1>
                    <p className="text-gray-400 text-sm">Drag and drop pieces to reconstruct the image</p>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-4 mb-6">
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur">
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                            <Clock className="w-3 h-3" /> TIME
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">{fmt(seconds)}</span>
                        {bestTime !== null && <span className="text-xs text-yellow-400">Best {fmt(bestTime)}</span>}
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur">
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                            <Move className="w-3 h-3" /> SWAPS
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">{moves}</span>
                        {bestMoves !== null && <span className="text-xs text-yellow-400">Best {bestMoves}</span>}
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur">
                        <div className="text-purple-300 text-xs mb-1">✅ PLACED</div>
                        <span className="text-2xl font-mono font-bold text-white">{solved} / {TOTAL}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
                    {/* Reference image (hint) */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-between w-full mb-2 px-1">
                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Target</span>
                            <button
                                onClick={() => setShowHint((v) => !v)}
                                className="flex items-center gap-1 text-xs text-purple-300 hover:text-purple-100 transition-colors"
                            >
                                {showHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                {showHint ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <div
                            className={`grid rounded-xl overflow-hidden border-2 border-purple-500/50 transition-opacity duration-300 ${showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: 140 }}
                        >
                            {[...Array(TOTAL)].map((_, id) => {
                                const row = Math.floor(id / COLS);
                                const col = id % COLS;
                                return (
                                    <div
                                        key={id}
                                        style={{ ...getTileStyle(row, col), width: 35, height: 35 }}
                                    />
                                );
                            })}
                        </div>
                        {!showHint && (
                            <div className="w-[140px] h-[140px] rounded-xl border-2 border-purple-500/30 border-dashed flex items-center justify-center text-purple-500 text-xs">
                                Hidden
                            </div>
                        )}
                    </div>

                    {/* Puzzle board */}
                    <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-2">Puzzle</span>
                        <div
                            className="grid rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-2xl shadow-purple-900/50"
                            style={{
                                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                                width: 'min(380px, 80vw)',
                            }}
                        >
                            {board.map((pieceId, pos) => {
                                const pieceRow = Math.floor(pieceId / COLS);
                                const pieceCol = pieceId % COLS;
                                const isCorrect = pieceId === pos;
                                return (
                                    <div
                                        key={pos}
                                        draggable
                                        onDragStart={() => handleDragStart(pos)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDrop(pos)}
                                        className={`relative cursor-grab active:cursor-grabbing select-none transition-all duration-150 hover:brightness-110 hover:scale-[1.04] hover:z-10 ${isCorrect ? 'ring-2 ring-inset ring-green-400/70' : ''
                                            }`}
                                        style={{
                                            ...getTileStyle(pieceRow, pieceCol),
                                            aspectRatio: '1',
                                        }}
                                    >
                                        {/* piece number overlay */}
                                        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white/50">
                                            {pieceId + 1}
                                        </span>
                                        {isCorrect && (
                                            <div className="absolute inset-0 bg-green-400/10 flex items-center justify-center">
                                                <span className="text-green-300 text-lg">✓</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 max-w-[380px] mx-auto md:ml-[196px]">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((solved / TOTAL) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-green-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(solved / TOTAL) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-center mt-8">
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
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Puzzle Complete!</h2>
                        <p className="text-gray-300 mb-6">
                            <span className="text-yellow-400 font-semibold">{moves} swaps</span> in{' '}
                            <span className="text-yellow-400 font-semibold">{fmt(seconds)}</span>
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

export default JigsawPuzzle;
