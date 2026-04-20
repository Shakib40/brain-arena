import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Eraser } from 'lucide-react';

const WORDS = ['CAT', 'DOG', 'TREE', 'HOUSE', 'SUN', 'STAR', 'FISH', 'BIRD', 'CAR', 'MOON', 'APPLE', 'BOOK'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];
const THICKNESSES = [2, 5, 10, 18];

const DrawAndGuess = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [thickness, setThickness] = useState(5);
    const [erasing, setErasing] = useState(false);
    const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
    const [revealed, setRevealed] = useState(false);
    const [guess, setGuess] = useState('');
    const [result, setResult] = useState(''); // 'correct' | 'wrong' | ''
    const [hints, setHints] = useState(0);
    const lastPos = useRef(null);

    const newRound = () => {
        setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
        setRevealed(false); setGuess(''); setResult(''); setHints(0);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) { ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches?.[0] || e;
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };

    const startDraw = useCallback((e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const pos = getPos(e, canvas);
        setDrawing(true);
        lastPos.current = pos;
    }, []);

    const draw = useCallback((e) => {
        e.preventDefault();
        if (!drawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e, canvas);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = erasing ? '#1e1b4b' : color;
        ctx.lineWidth = erasing ? 20 : thickness;
        ctx.lineCap = 'round';
        ctx.stroke();
        lastPos.current = pos;
    }, [drawing, color, thickness, erasing]);

    const stopDraw = () => { setDrawing(false); lastPos.current = null; };

    const submitGuess = () => {
        if (guess.toUpperCase() === word) {
            setResult('correct'); setRevealed(true);
        } else {
            setResult('wrong');
            setTimeout(() => setResult(''), 1000);
        }
    };

    const showHint = () => {
        const next = Math.min(hints + 1, word.length);
        setHints(next);
    };

    const masked = word.split('').map((ch, i) => i < hints ? ch : '_').join(' ');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-4 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center mb-4">
                    <h1 className="text-4xl font-bold text-white mb-1">🎨 Draw & Guess</h1>
                    <p className="text-gray-400 text-sm">Draw the word, then guess what it is!</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Canvas */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {COLORS.map((c) => (
                                <button key={c} onClick={() => { setColor(c); setErasing(false); }}
                                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-125 ${color === c && !erasing ? 'border-white scale-125' : 'border-transparent'}`}
                                    style={{ background: c }} />
                            ))}
                            <div className="w-px h-6 bg-white/20" />
                            {THICKNESSES.map((t) => (
                                <button key={t} onClick={() => { setThickness(t); setErasing(false); }}
                                    className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all ${thickness === t && !erasing ? 'border-purple-400 bg-purple-500/30' : 'border-white/20 bg-white/5'}`}>
                                    <div className="rounded-full bg-white" style={{ width: t, height: t }} />
                                </button>
                            ))}
                            <button onClick={() => setErasing((e) => !e)} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${erasing ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300' : 'border-white/20 bg-white/5 text-gray-300'}`}>
                                <Eraser className="w-3 h-3" /> Eraser
                            </button>
                        </div>
                        <canvas
                            ref={canvasRef}
                            className="rounded-xl w-full border-2 border-purple-500/50 touch-none"
                            style={{ height: 320, cursor: erasing ? 'cell' : 'crosshair' }}
                            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                        />
                    </div>

                    {/* Panel */}
                    <div className="lg:w-64 flex flex-col gap-3">
                        <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-purple-300 text-xs mb-1 uppercase font-semibold">Word to draw</p>
                            <p className="text-white font-bold text-2xl tracking-widest">{revealed ? word : masked}</p>
                        </div>

                        <button onClick={showHint} disabled={hints >= word.length || revealed}
                            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-sm font-semibold py-2 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                            💡 Reveal next letter ({hints}/{word.length})
                        </button>

                        <div className="flex gap-2">
                            <input value={guess} onChange={(e) => setGuess(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                                placeholder="Type your guess…"
                                className="flex-1 bg-white/10 border border-purple-500/50 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400" />
                            <button onClick={submitGuess} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 rounded-xl transition-all hover:scale-105">✓</button>
                        </div>

                        {result === 'correct' && <p className="text-green-400 font-bold text-center">🎉 Correct!</p>}
                        {result === 'wrong' && <p className="text-red-400 font-bold text-center">✗ Try again!</p>}

                        <div className="flex gap-2">
                            <button onClick={newRound} className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2 rounded-xl transition-all hover:scale-105">
                                <RotateCcw className="w-4 h-4" /> New Word
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawAndGuess;
