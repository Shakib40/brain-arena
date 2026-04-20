import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

const COLS = 20, ROWS = 15, TICK = 130;
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };

const rnd = (max) => Math.floor(Math.random() * max);
const randFood = (snakes) => {
    let pos;
    do { pos = { x: rnd(COLS), y: rnd(ROWS) }; }
    while (snakes.some((s) => s.body.some((b) => b.x === pos.x && b.y === pos.y)));
    return pos;
};

const SNAKE_COLORS = ['text-green-400', 'text-red-400'];
const SNAKE_BG = ['bg-green-500', 'bg-red-500'];
const SNAKE_BG_DARK = ['bg-green-700', 'bg-red-700'];

const initSnakes = () => [
    { body: [{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }], dir: [1, 0], alive: true, score: 0 },
    { body: [{ x: 14, y: 7 }, { x: 15, y: 7 }, { x: 16, y: 7 }], dir: [-1, 0], alive: true, score: 0 },
];

const MultiplayerSnake = () => {
    const navigate = useNavigate();
    const [snakes, setSnakes] = useState(initSnakes);
    const [food, setFood] = useState({ x: 10, y: 7 });
    const [running, setRunning] = useState(false);
    const [over, setOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const nextDir = useRef([[1, 0], [-1, 0]]);
    const snakesRef = useRef(snakes);
    const foodRef = useRef(food);

    useEffect(() => { snakesRef.current = snakes; }, [snakes]);
    useEffect(() => { foodRef.current = food; }, [food]);

    const startNew = () => {
        const ns = initSnakes();
        setSnakes(ns); snakesRef.current = ns;
        const f = randFood(ns);
        setFood(f); foodRef.current = f;
        nextDir.current = [[1, 0], [-1, 0]];
        setOver(false); setWinner(null); setRunning(false);
    };

    useEffect(() => {
        const handler = (e) => {
            if (DIRS[e.key]) { e.preventDefault(); const [dx, dy] = DIRS[e.key]; nextDir.current[0] = [dx, dy]; }
            const map = { w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
            if (map[e.key]) { e.preventDefault(); nextDir.current[1] = map[e.key]; }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!running || over) return;
        const id = setInterval(() => {
            setSnakes((prev) => {
                const next = prev.map((s, si) => {
                    if (!s.alive) return s;
                    const [dx, dy] = nextDir.current[si];
                    const head = { x: s.body[0].x + dx, y: s.body[0].y + dy };
                    // wall collision
                    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS)
                        return { ...s, alive: false };
                    // self collision
                    if (s.body.some((b) => b.x === head.x && b.y === head.y))
                        return { ...s, alive: false };
                    // other snake
                    const other = prev[1 - si];
                    if (other.body.some((b) => b.x === head.x && b.y === head.y))
                        return { ...s, alive: false };
                    const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
                    const body = ate ? [head, ...s.body] : [head, ...s.body.slice(0, -1)];
                    if (ate) {
                        const nf = randFood(prev);
                        setFood(nf); foodRef.current = nf;
                    }
                    return { ...s, body, score: s.score + (ate ? 10 : 0) };
                });
                const alive = next.filter((s) => s.alive);
                if (alive.length < 2) {
                    setOver(true); setRunning(false);
                    if (alive.length === 1) setWinner(next.indexOf(alive[0]));
                    else setWinner(null);
                }
                return next;
            });
        }, TICK);
        return () => clearInterval(id);
    }, [running, over]);

    const cellType = (x, y) => {
        for (let si = 0; si < snakes.length; si++) {
            const s = snakes[si];
            if (!s.alive) continue;
            if (s.body[0].x === x && s.body[0].y === y) return { snake: si, head: true };
            if (s.body.slice(1).some((b) => b.x === x && b.y === y)) return { snake: si, head: false };
        }
        if (food.x === x && food.y === y) return { food: true };
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-4 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center mb-4">
                    <div className="text-4xl mb-1">🐍</div>
                    <h1 className="text-3xl font-bold text-white">Multiplayer Snake</h1>
                </div>

                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-green-500/20 rounded-xl px-4 py-2">
                        <span className="text-green-400 font-bold text-sm">P1 (Arrows)</span>
                        <span className="text-white font-bold">{snakes[0].score}</span>
                        {!snakes[0].alive && <span className="text-red-400 text-xs">💀</span>}
                    </div>
                    <div className="flex gap-2">
                        {!running && !over && <button onClick={() => setRunning(true)} className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2 rounded-xl transition-all hover:scale-105">▶ Start</button>}
                        <button onClick={startNew} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:scale-105"><RotateCcw className="w-4 h-4" />Reset</button>
                    </div>
                    <div className="flex items-center gap-2 bg-red-500/20 rounded-xl px-4 py-2">
                        {!snakes[1].alive && <span className="text-red-400 text-xs">💀</span>}
                        <span className="text-white font-bold">{snakes[1].score}</span>
                        <span className="text-red-400 font-bold text-sm">P2 (WASD)</span>
                    </div>
                </div>

                {!running && !over && (
                    <p className="text-center text-gray-400 text-sm mb-3">P1: Arrow keys &nbsp;|&nbsp; P2: W A S D</p>
                )}

                {/* Grid */}
                <div className="border-2 border-purple-500/40 rounded-xl overflow-hidden shadow-2xl"
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, aspectRatio: `${COLS}/${ROWS}` }}>
                    {Array.from({ length: ROWS }, (_, y) =>
                        Array.from({ length: COLS }, (_, x) => {
                            const ct = cellType(x, y);
                            let cls = 'bg-transparent';
                            if (ct?.food) cls = 'bg-red-500 rounded-full scale-75';
                            else if (ct?.head) cls = `${SNAKE_BG[ct.snake]} rounded-sm`;
                            else if (ct) cls = `${SNAKE_BG_DARK[ct.snake]} rounded-sm opacity-80`;
                            return <div key={`${x}-${y}`} className={`w-full h-full transition-colors ${cls}`} />;
                        })
                    )}
                </div>
            </div>

            {over && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {winner !== null ? `Player ${winner + 1} Wins!` : 'Draw!'}
                        </h2>
                        <p className="text-gray-300 mb-6">P1: {snakes[0].score} pts &nbsp;|&nbsp; P2: {snakes[1].score} pts</p>
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

export default MultiplayerSnake;
