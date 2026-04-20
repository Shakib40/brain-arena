import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock, Move, Lightbulb } from 'lucide-react';

// ── Config ────────────────────────────────────────────────────────────────────
const WORDS = ['REACT', 'ASYNC', 'ARRAY', 'CLASS', 'SCOPE', 'EVENT', 'STATE', 'PROPS', 'HOOKS', 'QUEUE', 'STACK', 'TUPLE'];
const ROUND_WORDS = 5;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const scramble = (word) => {
    let s;
    do { s = shuffle([...word]).join(''); } while (s === word);
    return s;
};

const pick = (n) => shuffle(WORDS).slice(0, n);

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const AnagramSolver = () => {
    const navigate = useNavigate();
    const [wordList] = useState(() => pick(ROUND_WORDS));
    const [current, setCurrent] = useState(0);
    const [scrambled, setScrambled] = useState(() => scramble(pick(ROUND_WORDS)[0]));
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState(''); // 'correct' | 'wrong' | ''
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [won, setWon] = useState(false);
    const [hints, setHints] = useState(3);
    const [hintText, setHintText] = useState('');
    const [letters, setLetters] = useState([]);
    const inputRef = useRef(null);

    // init letters from scrambled word
    useEffect(() => {
        if (wordList[current]) {
            const s = scramble(wordList[current]);
            setScrambled(s);
            setLetters(s.split('').map((ch, i) => ({ ch, id: i, used: false })));
            setInput('');
            setHintText('');
        }
    }, [current, wordList]);

    useEffect(() => {
        if (running) {
            const id = setInterval(() => setSeconds((s) => s + 1), 1000);
            return () => clearInterval(id);
        }
    }, [running]);

    const handleSubmit = useCallback(() => {
        if (!input) return;
        if (!running) setRunning(true);
        const target = wordList[current];
        if (input.toUpperCase() === target) {
            setScore((s) => s + 100 + streak * 20);
            setStreak((s) => s + 1);
            setFeedback('correct');
            setTimeout(() => {
                setFeedback('');
                if (current + 1 >= wordList.length) { setRunning(false); setWon(true); }
                else setCurrent((c) => c + 1);
            }, 800);
        } else {
            setStreak(0);
            setFeedback('wrong');
            setTimeout(() => setFeedback(''), 800);
            setInput('');
            setLetters(scrambled.split('').map((ch, i) => ({ ch, id: i, used: false })));
        }
    }, [input, current, wordList, streak, scrambled, running]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Enter') handleSubmit(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSubmit]);

    const clickLetter = (id) => {
        const letter = letters.find((l) => l.id === id && !l.used);
        if (!letter) return;
        setInput((inp) => inp + letter.ch);
        setLetters((prev) => prev.map((l) => l.id === id ? { ...l, used: true } : l));
    };

    const clearInput = () => {
        setInput('');
        setLetters(scrambled.split('').map((ch, i) => ({ ch, id: i, used: false })));
    };

    const useHint = () => {
        if (hints === 0) return;
        setHints((h) => h - 1);
        const target = wordList[current];
        const revealLen = Math.min(input.length + 1, target.length);
        setHintText(`Starts with: ${target.slice(0, revealLen)}`);
    };

    const startNew = () => window.location.reload();

    const word = wordList[current];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="container mx-auto px-4 py-6 max-w-lg">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🔄</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Anagram Solver</h1>
                    <p className="text-gray-400 text-sm">Unscramble the letters to form the correct word</p>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-3 mb-6">
                    <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                        <div className="text-xs text-purple-300">SCORE</div>
                        <div className="text-xl font-bold text-white">{score}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                        <div className="text-xs text-purple-300">WORD</div>
                        <div className="text-xl font-bold text-white">{current + 1} / {wordList.length}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                        <div className="text-xs text-purple-300 flex items-center gap-1"><Clock className="w-3 h-3" />TIME</div>
                        <div className="text-xl font-bold text-white font-mono">{fmt(seconds)}</div>
                    </div>
                    {streak > 1 && (
                        <div className="bg-yellow-500/20 rounded-xl px-4 py-2 text-center">
                            <div className="text-xs text-yellow-300">STREAK</div>
                            <div className="text-xl font-bold text-yellow-400">🔥{streak}</div>
                        </div>
                    )}
                </div>

                {/* Scrambled word */}
                <div className={`text-center mb-6 transition-all ${feedback === 'correct' ? 'scale-110' : feedback === 'wrong' ? 'animate-pulse' : ''}`}>
                    <p className="text-gray-400 text-sm mb-3">Unscramble this word:</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {letters.map((l) => (
                            <button
                                key={l.id}
                                onClick={() => clickLetter(l.id)}
                                disabled={l.used}
                                className={`w-12 h-12 rounded-xl text-xl font-bold transition-all border-2 ${l.used
                                        ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                                        : 'bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400 text-white hover:scale-110 hover:shadow-lg cursor-pointer'
                                    }`}
                            >
                                {l.ch}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Answer input */}
                <div className={`flex gap-2 mb-4 ${feedback === 'correct' ? 'opacity-0' : ''}`}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                            if (val.length <= word?.length) setInput(val);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Type or click letters..."
                        className="flex-1 bg-white/10 border border-purple-500/50 text-white placeholder-gray-500 rounded-xl px-4 py-3 font-mono text-lg tracking-widest outline-none focus:border-purple-400"
                    />
                    <button onClick={clearInput} className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 rounded-xl transition-all" title="Clear">✕</button>
                </div>

                {/* Feedback */}
                <div className="h-6 text-center mb-4">
                    {feedback === 'correct' && <span className="text-green-400 font-bold text-lg">✓ Correct! +{100 + Math.max(0, streak - 1) * 20}</span>}
                    {feedback === 'wrong' && <span className="text-red-400 font-bold">✗ Try again!</span>}
                    {hintText && !feedback && <span className="text-yellow-300 text-sm">{hintText}</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95">
                        Submit
                    </button>
                    <button onClick={useHint} disabled={hints === 0} className={`flex items-center gap-1.5 font-semibold px-4 py-3 rounded-xl transition-all hover:scale-105 ${hints > 0 ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}>
                        <Lightbulb className="w-4 h-4" /> Hint ({hints})
                    </button>
                    <button onClick={clearInput} className="bg-white/10 hover:bg-white/20 text-gray-300 font-semibold px-4 py-3 rounded-xl transition-all hover:scale-105">
                        Clear
                    </button>
                </div>
            </div>

            {won && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">All Done!</h2>
                        <p className="text-gray-300 mb-1">Final score: <span className="text-yellow-400 font-bold text-2xl">{score}</span></p>
                        <p className="text-gray-400 text-sm mb-6">Time: {fmt(seconds)}</p>
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

export default AnagramSolver;
