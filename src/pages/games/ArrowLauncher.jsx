import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Play, RotateCcw, Trophy } from 'lucide-react';

const ArrowLauncher = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('start'); // start, playing, ended
    const [score, setScore] = useState(0);
    const [arrows, setArrows] = useState(10);
    const [power, setPower] = useState(0);
    const [isCharging, setIsCharging] = useState(false);
    const [angle, setAngle] = useState(0);

    const gameData = useRef({
        firedArrows: [],
        targets: [],
        lastTime: 0,
        requestId: null,
        mousePos: { x: 0, y: 0 }
    });

    const createTarget = useCallback(() => {
        return {
            x: 800 + Math.random() * 200,
            y: 100 + Math.random() * 400,
            size: 30 + Math.random() * 20,
            speed: 1 + Math.random() * 3,
            direction: Math.random() > 0.5 ? 1 : -1
        };
    }, []);

    const initGame = () => {
        setScore(0);
        setArrows(10);
        setGameState('playing');
        gameData.current.firedArrows = [];
        gameData.current.targets = Array.from({ length: 3 }, createTarget);
    };

    const update = (time) => {
        if (gameState !== 'playing') return;

        const dt = time - gameData.current.lastTime;
        gameData.current.lastTime = time;

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, 1000, 600);

        // Update & Draw Targets
        gameData.current.targets.forEach(t => {
            t.y += t.speed * t.direction;
            if (t.y < 50 || t.y > 550) t.direction *= -1;

            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
        });

        // Update & Draw Arrows
        gameData.current.firedArrows = gameData.current.firedArrows.filter(arrow => {
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;
            arrow.vy += 0.15; // Gravity

            // DRAW ARROW
            ctx.save();
            ctx.translate(arrow.x, arrow.y);
            ctx.rotate(Math.atan2(arrow.vy, arrow.vx));

            // Shaft
            ctx.beginPath();
            ctx.moveTo(-25, 0);
            ctx.lineTo(25, 0);
            ctx.strokeStyle = '#d4d4d8';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Fletching (feathers)
            ctx.beginPath();
            ctx.moveTo(-25, 0);
            ctx.lineTo(-35, -8);
            ctx.lineTo(-30, 0);
            ctx.lineTo(-35, 8);
            ctx.closePath();
            ctx.fillStyle = '#ef4444';
            ctx.fill();

            // Arrow head (sharp triangle)
            ctx.beginPath();
            ctx.moveTo(25, 0);
            ctx.lineTo(15, -6);
            ctx.lineTo(15, 6);
            ctx.closePath();
            ctx.fillStyle = '#71717a';
            ctx.fill();

            ctx.restore();

            // Collision detection
            let hit = false;
            gameData.current.targets.forEach((t, idx) => {
                const dx = arrow.x - t.x;
                const dy = arrow.y - t.y;
                if (Math.sqrt(dx * dx + dy * dy) < t.size) {
                    hit = true;
                    setScore(s => s + 50);
                    gameData.current.targets[idx] = createTarget();
                }
            });

            return !hit && arrow.x < 1100 && arrow.y < 700;
        });

        // Draw Bow/Archer Position
        ctx.save();
        ctx.translate(100, 300);
        ctx.rotate(angle);

        // Draw string
        ctx.beginPath();
        ctx.moveTo(0, -70);
        if (isCharging) {
            ctx.lineTo(-power * 0.6, 0);
            ctx.lineTo(0, 70);
        } else {
            ctx.lineTo(0, 70);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw bow (detailed curve)
        ctx.beginPath();
        ctx.moveTo(0, -70);
        ctx.quadraticCurveTo(50, 0, 0, 70);
        ctx.strokeStyle = '#78350f'; // Dark wood
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bow grip/accent
        ctx.beginPath();
        ctx.arc(28, 0, 10, -Math.PI / 4, Math.PI / 4);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 4;
        ctx.stroke();

        if (isCharging) {
            // Draw arrow being charged
            ctx.save();
            ctx.translate(-power * 0.6 + 20, 0);

            // Shaft
            ctx.beginPath();
            ctx.moveTo(-45, 0);
            ctx.lineTo(5, 0);
            ctx.strokeStyle = '#d4d4d8';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Fletching
            ctx.beginPath();
            ctx.moveTo(-45, 0);
            ctx.lineTo(-55, -8);
            ctx.lineTo(-50, 0);
            ctx.lineTo(-55, 8);
            ctx.closePath();
            ctx.fillStyle = '#ef4444';
            ctx.fill();

            // Head
            ctx.beginPath();
            ctx.moveTo(5, 0);
            ctx.lineTo(-5, -6);
            ctx.lineTo(-5, 6);
            ctx.closePath();
            ctx.fillStyle = '#71717a';
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();

        gameData.current.requestId = requestAnimationFrame(update);
    };

    useEffect(() => {
        if (gameState === 'playing') {
            gameData.current.requestId = requestAnimationFrame(update);
        }
        return () => cancelAnimationFrame(gameData.current.requestId);
    }, [gameState, power, angle, isCharging]);

    const handleMouseDown = () => {
        if (gameState !== 'playing' || arrows <= 0) return;
        setIsCharging(true);
        setPower(0);
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 1000;
        const y = ((e.clientY - rect.top) / rect.height) * 600;

        const dx = x - 100;
        const dy = y - 300;
        setAngle(Math.atan2(dy, dx));
    };

    const handleMouseUp = () => {
        if (!isCharging) return;
        setIsCharging(false);

        // Fire arrow
        const v = power * 0.2 + 5;
        gameData.current.firedArrows.push({
            x: 100,
            y: 300,
            vx: Math.cos(angle) * v,
            vy: Math.sin(angle) * v
        });

        setArrows(a => {
            const next = a - 1;
            if (next === 0 && gameData.current.firedArrows.length === 0) {
                // Check win after a delay to allow last arrow to settle?
                // Actually let's check it in the loop or here
            }
            return next;
        });
        setPower(0);
    };

    useEffect(() => {
        let timer;
        if (isCharging) {
            timer = setInterval(() => {
                setPower(p => Math.min(p + 2, 100));
            }, 20);
        }
        return () => clearInterval(timer);
    }, [isCharging]);

    // Check Game Over
    useEffect(() => {
        if (gameState === 'playing' && arrows === 0 && gameData.current.firedArrows.length === 0) {
            const timeout = setTimeout(() => {
                setGameState('ended');
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [arrows, gameState]);

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                >
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>

                <div className="text-center">
                    <h1 className="text-4xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Arrow Launcher</h1>
                    <p className="text-sm opacity-60" style={{ color: 'var(--text-primary)' }}>Aim and hit the red targets!</p>
                </div>

                <div className="flex gap-4">
                    <div className="glass-panel px-6 py-2 rounded-2xl text-center">
                        <div className="text-[10px] uppercase font-bold opacity-50">Arrows</div>
                        <div className="text-2xl font-black">{arrows}</div>
                    </div>
                    <div className="glass-panel px-6 py-2 rounded-2xl text-center">
                        <div className="text-[10px] uppercase font-bold opacity-50">Score</div>
                        <div className="text-2xl font-black">{score}</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center relative">
                <div className="relative glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl w-full max-w-5xl aspect-[10/6]">
                    <canvas
                        ref={canvasRef}
                        width={1000}
                        height={600}
                        className="w-full h-full cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />

                    {gameState === 'start' && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-center items-center justify-center flex-col p-8 text-center">
                            <Target className="w-24 h-24 mb-6 text-red-500 animate-pulse" />
                            <h2 className="text-5xl font-black mb-4">Precision Challenge</h2>
                            <p className="text-lg opacity-80 mb-10 max-w-md">How many targets can you hit with 10 arrows? Charge your shot for more power!</p>
                            <button
                                onClick={initGame}
                                className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-bold text-xl hover:scale-105 transition-transform"
                            >
                                <Play className="w-6 h-6 fill-current" /> Launch Now
                            </button>
                        </div>
                    )}

                    {gameState === 'ended' && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-center items-center justify-center flex-col p-8 text-center">
                            <Trophy className="w-24 h-24 mb-6 text-yellow-400" />
                            <h2 className="text-5xl font-black mb-2">Final Score</h2>
                            <div className="text-7xl font-black text-white mb-8">{score}</div>
                            <div className="flex gap-4">
                                <button
                                    onClick={initGame}
                                    className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                                >
                                    <RotateCcw className="w-5 h-5" /> Play Again
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-3 bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Exit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Power Bar */}
                    {isCharging && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-4 bg-white/10 rounded-full overflow-hidden border border-white/20">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-75"
                                style={{ width: `${power}%` }}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ArrowLauncher;
