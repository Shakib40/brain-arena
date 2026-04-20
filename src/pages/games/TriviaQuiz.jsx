import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock, Zap } from 'lucide-react';

const QUESTIONS = [
    { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HighText Machine Language', 'Hyperlink and Text Markup Language', 'None'], answer: 0 },
    { q: 'Which language runs in a web browser?', options: ['Python', 'Java', 'JavaScript', 'C++'], answer: 2 },
    { q: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], answer: 1 },
    { q: 'Which of these is a JavaScript framework?', options: ['Django', 'Laravel', 'React', 'Flask'], answer: 2 },
    { q: 'What does DOM stand for?', options: ['Document Object Model', 'Data Object Model', 'Document Oriented Model', 'Digital Object Manager'], answer: 0 },
    { q: 'Which tag creates a hyperlink in HTML?', options: ['<link>', '<a>', '<href>', '<url>'], answer: 1 },
    { q: 'What does JSON stand for?', options: ['JavaScript Object Notation', 'Java Standard Output Notation', 'JavaScript Online Network', 'Java Serialized Object Name'], answer: 0 },
    { q: 'Which method adds to the end of an array?', options: ['shift()', 'unshift()', 'pop()', 'push()'], answer: 3 },
    { q: 'What is the result of typeof null in JS?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 2 },
    { q: 'Which HTTP method is used to retrieve data?', options: ['POST', 'PUT', 'GET', 'DELETE'], answer: 2 },
];

const TOTAL_TIME = 15;
const POINTS_BASE = 100;

const TriviaQuiz = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [chosen, setChosen] = useState(null);
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [gameOver, setGameOver] = useState(false);
    const [results, setResults] = useState([]); // {correct}
    const timerRef = useRef(null);

    const startNew = () => { setCurrent(0); setScore(0); setStreak(0); setChosen(null); setTimeLeft(TOTAL_TIME); setGameOver(false); setResults([]); };

    const next = useCallback((pickedIdx) => {
        clearInterval(timerRef.current);
        const q = QUESTIONS[current];
        const correct = pickedIdx === q.answer;
        const bonus = correct ? POINTS_BASE + streak * 25 + Math.floor(timeLeft * 5) : 0;
        setScore((s) => s + bonus);
        setStreak((s) => correct ? s + 1 : 0);
        setChosen(pickedIdx);
        setResults((r) => [...r, { correct }]);

        setTimeout(() => {
            if (current + 1 >= QUESTIONS.length) { setGameOver(true); return; }
            setCurrent((c) => c + 1);
            setChosen(null);
            setTimeLeft(TOTAL_TIME);
        }, 1200);
    }, [current, streak, timeLeft]);

    useEffect(() => {
        if (chosen !== null || gameOver) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) { next(null); return TOTAL_TIME; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [current, chosen, gameOver, next]);

    const q = QUESTIONS[current];

    const optStyle = (i) => {
        if (chosen === null) return 'bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer hover:scale-[1.02]';
        if (i === q.answer) return 'bg-green-600/80 border-green-400 text-white';
        if (i === chosen) return 'bg-red-500/80 border-red-400 text-white';
        return 'bg-white/5 border-white/10 text-gray-400';
    };

    const pct = (timeLeft / TOTAL_TIME) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="container mx-auto px-4 py-6 max-w-xl">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center mb-5">
                    <div className="text-5xl mb-2">🤓</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Trivia Quiz</h1>
                    <p className="text-gray-400 text-sm">Answer fast for bonus points!</p>
                </div>

                {!gameOver ? (
                    <>
                        {/* Progress + stats */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2">
                                {QUESTIONS.map((_, i) => (
                                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < current ? (results[i]?.correct ? 'bg-green-400' : 'bg-red-400') : i === current ? 'bg-yellow-400' : 'bg-white/20'}`} />
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                {streak > 1 && <span className="text-yellow-400 text-sm font-bold">🔥 {streak}x</span>}
                                <span className="text-white font-bold">{score} pts</span>
                            </div>
                        </div>

                        {/* Timer bar */}
                        <div className="w-full bg-white/10 rounded-full h-2 mb-5">
                            <div className={`h-2 rounded-full transition-all duration-1000 ${pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>

                        {/* Question */}
                        <div className="bg-white/10 rounded-2xl p-6 mb-5 border border-white/10">
                            <div className="flex justify-between text-xs text-purple-300 mb-3">
                                <span>Question {current + 1} of {QUESTIONS.length}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeLeft}s</span>
                            </div>
                            <p className="text-white text-lg font-semibold">{q.q}</p>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-3">
                            {q.options.map((opt, i) => (
                                <button key={i} onClick={() => chosen === null && next(i)}
                                    className={`text-left px-5 py-3 rounded-xl border-2 font-semibold transition-all duration-200 ${optStyle(i)}`}>
                                    <span className="text-purple-300 mr-3">{['A', 'B', 'C', 'D'][i]}.</span>{opt}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
                        <p className="text-2xl font-bold text-yellow-400 mb-2">{score} points</p>
                        <p className="text-gray-300 mb-2">{results.filter((r) => r.correct).length} / {QUESTIONS.length} correct</p>
                        <div className="flex justify-center gap-1 mb-6">
                            {results.map((r, i) => <span key={i} className={`text-lg ${r.correct ? '✅' : '❌'}`}>{r.correct ? '✅' : '❌'}</span>)}
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button onClick={startNew} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"><RotateCcw className="w-4 h-4" />Play Again</button>
                            <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"><ArrowLeft className="w-4 h-4" />Dashboard</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TriviaQuiz;
