import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, XCircle, Delete } from 'lucide-react';

// ── Word list (common 5-letter words) ────────────────────────────────────────
const WORDS = [
    'APPLE', 'BRAVE', 'CRANE', 'DANCE', 'EAGLE', 'FLAME', 'GRACE', 'HUMOR', 'INDEX', 'JOKER',
    'KNIFE', 'LEMON', 'MAPLE', 'NIGHT', 'OLIVE', 'PIANO', 'QUEEN', 'RIVER', 'STONE', 'TIGER',
    'UNCLE', 'VIVID', 'WATER', 'XENON', 'YACHT', 'ZEBRA', 'ALBUM', 'BENCH', 'CHESS', 'DRAIN',
    'EARTH', 'FLEET', 'GLOBE', 'HEART', 'IVORY', 'JEWEL', 'KNACK', 'LIGHT', 'MANGO', 'NERVE',
    'OCEAN', 'PLANT', 'QUILT', 'RIDER', 'SHELF', 'TRAIL', 'URBAN', 'VAULT', 'WINDY', 'YOUTH',
    'BLEND', 'CREAM', 'DRIFT', 'EVENT', 'FLAIR', 'GLOOM', 'HASTE', 'IDEAL', 'JUMPY', 'KNELT',
    'LUNAR', 'MOUSE', 'NASAL', 'OVALS', 'PEARL', 'QUALM', 'RAINY', 'SMITH', 'THORN', 'UNDER',
    'VIRAL', 'WRECK', 'EXALT', 'YEAST', 'ZONAL', 'ABIDE', 'BLAZE', 'CRAFT', 'DEPTH', 'EXPEL',
    'FLUTE', 'GRAZE', 'HOIST', 'INPUT', 'JAUNT', 'KNOBS', 'LEAPT', 'MOTIF', 'NIMBLE', 'OPTIC',
    'PLUME', 'QUEST', 'ROAST', 'SCOPE', 'TWIST', 'UNFED', 'VENOM', 'WALTZ', 'EXACT', 'ZINGY',
];

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

const MAX_GUESSES = 6;
const WORD_LEN = 5;

const randomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

// ── Tile status ───────────────────────────────────────────────────────────────
const evaluateGuess = (guess, target) => {
    const result = Array(WORD_LEN).fill('absent');
    const targetArr = [...target];
    const guessArr = [...guess];

    // first pass: correct
    guessArr.forEach((ch, i) => {
        if (ch === targetArr[i]) { result[i] = 'correct'; targetArr[i] = null; guessArr[i] = null; }
    });
    // second pass: present
    guessArr.forEach((ch, i) => {
        if (!ch) return;
        const j = targetArr.indexOf(ch);
        if (j !== -1) { result[i] = 'present'; targetArr[j] = null; }
    });
    return result;
};

const TILE_COLORS = {
    correct: 'bg-green-600 border-green-500 text-white',
    present: 'bg-yellow-500 border-yellow-400 text-white',
    absent: 'bg-gray-600 border-gray-500 text-white',
    empty: 'bg-transparent border-white/20 text-white',
    active: 'bg-transparent border-purple-400 text-white',
};

const KEY_COLORS = {
    correct: 'bg-green-600 text-white',
    present: 'bg-yellow-500 text-white',
    absent: 'bg-gray-600 text-gray-300',
    default: 'bg-white/15 text-white hover:bg-white/25',
};

// ── Component ─────────────────────────────────────────────────────────────────
const WordleClone = () => {
    const navigate = useNavigate();
    const [target, setTarget] = useState(randomWord);
    const [guesses, setGuesses] = useState([]); // [{word, result}]
    const [current, setCurrent] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [shake, setShake] = useState(false);
    const [message, setMessage] = useState('');
    const [reveal, setReveal] = useState(false); // animate reveal

    const showMessage = (msg, duration = 1800) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), duration);
    };

    const startNew = useCallback(() => {
        setTarget(randomWord());
        setGuesses([]);
        setCurrent('');
        setGameOver(false);
        setWon(false);
        setMessage('');
        setReveal(false);
    }, []);

    const submitGuess = useCallback(() => {
        if (current.length < WORD_LEN) { setShake(true); setTimeout(() => setShake(false), 500); showMessage('Not enough letters'); return; }
        const result = evaluateGuess(current, target);
        const newGuesses = [...guesses, { word: current, result }];
        setGuesses(newGuesses);
        setCurrent('');

        if (current === target) {
            setReveal(true);
            setTimeout(() => { setWon(true); setGameOver(true); setReveal(false); }, 1600);
        } else if (newGuesses.length === MAX_GUESSES) {
            setGameOver(true);
            showMessage(`The word was ${target}`, 5000);
        }
    }, [current, guesses, target]);

    const addLetter = useCallback((ch) => {
        if (gameOver || current.length >= WORD_LEN) return;
        setCurrent((c) => c + ch);
    }, [gameOver, current]);

    const deleteLetter = useCallback(() => {
        setCurrent((c) => c.slice(0, -1));
    }, []);

    const handleKey = useCallback((key) => {
        if (key === 'ENTER') { submitGuess(); return; }
        if (key === '⌫' || key === 'BACKSPACE') { deleteLetter(); return; }
        if (/^[A-Z]$/.test(key)) addLetter(key);
    }, [submitGuess, deleteLetter, addLetter]);

    // physical keyboard
    useEffect(() => {
        const handler = (e) => handleKey(e.key.toUpperCase());
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleKey]);

    // build key colour map
    const keyMap = {};
    guesses.forEach(({ word, result }) => {
        [...word].forEach((ch, i) => {
            const prev = keyMap[ch];
            const rank = { correct: 3, present: 2, absent: 1 };
            if (!prev || rank[result[i]] > rank[prev]) keyMap[ch] = result[i];
        });
    });

    // build grid rows
    const rows = [];
    for (let r = 0; r < MAX_GUESSES; r++) {
        const guess = guesses[r];
        rows.push(
            <div key={r} className={`flex gap-1.5 ${shake && r === guesses.length && !guess ? 'animate-[wiggle_0.5s]' : ''}`}>
                {[...Array(WORD_LEN)].map((_, c) => {
                    let letter = '';
                    let status = 'empty';
                    if (guess) { letter = guess.word[c]; status = guess.result[c]; }
                    else if (r === guesses.length && !gameOver) {
                        letter = current[c] || '';
                        status = letter ? 'active' : 'empty';
                    }
                    const isRevealing = reveal && r === guesses.length - 1;
                    return (
                        <div
                            key={c}
                            className={`w-14 h-14 border-2 text-xl font-bold flex items-center justify-center rounded-lg select-none transition-all duration-300 ${TILE_COLORS[status]} ${isRevealing ? 'scale-110' : ''}`}
                            style={isRevealing ? { transitionDelay: `${c * 100}ms` } : {}}
                        >
                            {letter}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="w-full max-w-md px-4 py-6">
                {/* Back */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-4 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-white mb-1">Wordle</h1>
                    <p className="text-gray-400 text-sm">Guess the 5-letter word in 6 tries</p>
                </div>

                {/* Toast message */}
                <div className={`text-center mb-3 h-6 transition-opacity duration-300 ${message ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="bg-white text-gray-900 text-sm font-semibold px-4 py-1 rounded-full shadow">{message}</span>
                </div>

                {/* Grid */}
                <div className="flex flex-col gap-1.5 items-center mb-6">
                    {rows}
                </div>

                {/* Keyboard */}
                <div className="flex flex-col gap-1.5 items-center">
                    {KEYBOARD_ROWS.map((row, ri) => (
                        <div key={ri} className="flex gap-1">
                            {row.map((key) => {
                                const status = keyMap[key];
                                const wide = key === 'ENTER' || key === '⌫';
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleKey(key)}
                                        className={`${wide ? 'px-3 text-xs' : 'w-9'} h-14 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95 ${status ? KEY_COLORS[status] : KEY_COLORS.default
                                            }`}
                                    >
                                        {key === '⌫' ? <Delete className="w-4 h-4 mx-auto" /> : key}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* New Game (when game over) */}
                {gameOver && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={startNew}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:scale-105"
                        >
                            <RotateCcw className="w-5 h-5" /> New Game
                        </button>
                    </div>
                )}
            </div>

            {/* Win overlay */}
            {won && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {guesses.length === 1 ? 'Genius!' : guesses.length <= 3 ? 'Impressive!' : 'Got it!'}
                        </h2>
                        <p className="text-gray-300 mb-2">
                            The word was <span className="text-yellow-400 font-bold">{target}</span>
                        </p>
                        <p className="text-gray-400 text-sm mb-6">Solved in {guesses.length} / {MAX_GUESSES} guesses</p>
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

export default WordleClone;
