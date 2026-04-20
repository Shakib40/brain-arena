import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock, Layers } from 'lucide-react';

// 8 emoji pairs → 16 cards
const EMOJI_POOL = ['🦊', '🐸', '🦋', '🐙', '🦄', '🐬', '🦁', '🐼'];

const createDeck = () => {
    const cards = [...EMOJI_POOL, ...EMOJI_POOL].map((emoji, i) => ({
        id: i,
        emoji,
        flipped: false,
        matched: false,
    }));
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
};

const fmt = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
};

const MemoryMatch = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState(createDeck);
    const [selected, setSelected] = useState([]); // indices of flipped-not-yet-checked cards
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [won, setWon] = useState(false);
    const [locked, setLocked] = useState(false); // prevent rapid clicking during mismatch delay
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
        setCards(createDeck());
        setSelected([]);
        setMoves(0);
        setSeconds(0);
        setRunning(false);
        setWon(false);
        setLocked(false);
    }, []);

    const handleCardClick = useCallback(
        (idx) => {
            if (locked || won) return;
            const card = cards[idx];
            if (card.flipped || card.matched) return;
            if (selected.includes(idx)) return;

            if (!running) setRunning(true);

            // flip the clicked card
            const next = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
            const newSelected = [...selected, idx];

            if (newSelected.length === 1) {
                setCards(next);
                setSelected(newSelected);
            } else {
                // second card flipped — check match
                setCards(next);
                setSelected([]);
                setMoves((m) => m + 1);
                setLocked(true);

                const [firstIdx] = selected;
                const firstEmoji = cards[firstIdx].emoji;
                const secondEmoji = card.emoji;

                if (firstEmoji === secondEmoji) {
                    // match!
                    setTimeout(() => {
                        setCards((prev) => {
                            const updated = prev.map((c) =>
                                c.emoji === firstEmoji ? { ...c, matched: true, flipped: true } : c
                            );
                            const allMatched = updated.every((c) => c.matched);
                            if (allMatched) {
                                setRunning(false);
                                setWon(true);
                                setMoves((m) => {
                                    const finalMoves = m; // already incremented
                                    setBestMoves((prev) => (prev === null || finalMoves < prev ? finalMoves : prev));
                                    return m;
                                });
                                setSeconds((s) => {
                                    setBestTime((prev) => (prev === null || s < prev ? s : prev));
                                    return s;
                                });
                            }
                            return updated;
                        });
                        setLocked(false);
                    }, 400);
                } else {
                    // no match — flip back after delay
                    setTimeout(() => {
                        setCards((prev) =>
                            prev.map((c, i) => (i === firstIdx || i === idx ? { ...c, flipped: false } : c))
                        );
                        setLocked(false);
                    }, 900);
                }
            }
        },
        [cards, selected, locked, won, running]
    );

    const matchedCount = cards.filter((c) => c.matched).length / 2;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Back */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                {/* Title */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🃏</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Memory Match</h1>
                    <p className="text-gray-400 text-sm">Flip cards to find all 8 matching pairs</p>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-4 mb-8">
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur">
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                            <Clock className="w-3 h-3" /> TIME
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">{fmt(seconds)}</span>
                        {bestTime !== null && <span className="text-xs text-yellow-400">Best {fmt(bestTime)}</span>}
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur">
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                            <Layers className="w-3 h-3" /> PAIRS
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">
                            {matchedCount} / {EMOJI_POOL.length}
                        </span>
                        {bestMoves !== null && <span className="text-xs text-yellow-400">Best {bestMoves} tries</span>}
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur">
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                            🎯 TRIES
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">{moves}</span>
                    </div>
                </div>

                {/* Card grid */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {cards.map((card, idx) => (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(idx)}
                            className="aspect-square cursor-pointer"
                            style={{ perspective: '600px' }}
                        >
                            <div
                                className="relative w-full h-full transition-transform duration-500"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                }}
                            >
                                {/* Back face */}
                                <div
                                    className="absolute inset-0 rounded-xl flex items-center justify-center text-2xl select-none"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 border-2 border-purple-500 flex items-center justify-center hover:border-purple-300 transition-colors">
                                        <span className="text-purple-400 text-3xl">?</span>
                                    </div>
                                </div>

                                {/* Front face */}
                                <div
                                    className="absolute inset-0 rounded-xl flex items-center justify-center text-3xl select-none"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <div
                                        className={`w-full h-full rounded-xl border-2 flex items-center justify-center transition-colors ${card.matched
                                                ? 'bg-gradient-to-br from-green-600 to-emerald-700 border-green-400 shadow-lg shadow-green-500/30'
                                                : 'bg-gradient-to-br from-pink-600 to-purple-700 border-pink-400 shadow-lg shadow-pink-500/30'
                                            }`}
                                    >
                                        {card.emoji}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* New game button */}
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
                        <h2 className="text-3xl font-bold text-white mb-2">All Pairs Found!</h2>
                        <p className="text-gray-300 mb-6">
                            <span className="text-yellow-400 font-semibold">{moves} tries</span> in{' '}
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

export default MemoryMatch;
