import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Move } from 'lucide-react';

const DISKS = 5;
const COLORS = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-red-500'];
const MIN_MOVES = Math.pow(2, DISKS) - 1;

const initialState = () => [[...Array(DISKS).keys()].reverse(), [], []];

const TowerOfHanoi = () => {
    const navigate = useNavigate();
    const [pegs, setPegs] = useState(initialState);
    const [selected, setSelected] = useState(null); // peg index
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);

    const startNew = () => { setPegs(initialState()); setSelected(null); setMoves(0); setWon(false); };

    const handlePegClick = useCallback((pegIdx) => {
        if (won) return;
        if (selected === null) {
            if (pegs[pegIdx].length > 0) setSelected(pegIdx);
            return;
        }
        if (selected === pegIdx) { setSelected(null); return; }
        // try to move top of selected → pegIdx
        const from = pegs[selected];
        const to = pegs[pegIdx];
        const disk = from[from.length - 1];
        if (to.length > 0 && to[to.length - 1] < disk) { setSelected(null); return; } // invalid
        const next = pegs.map((p) => [...p]);
        next[selected].pop();
        next[pegIdx].push(disk);
        const newMoves = moves + 1;
        setMoves(newMoves);
        setSelected(null);
        setPegs(next);
        if (next[2].length === DISKS) setWon(true);
    }, [pegs, selected, moves, won]);

    const maxH = DISKS + 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🗼</div>
                    <h1 className="text-4xl font-bold text-white mb-1">Tower of Hanoi</h1>
                    <p className="text-gray-400 text-sm">Move all disks to the rightmost peg • Click a peg to pick/place</p>
                </div>

                <div className="flex justify-center gap-6 mb-5">
                    <div className="bg-white/10 rounded-xl px-5 py-2 text-center">
                        <div className="text-xs text-purple-300">MOVES</div>
                        <div className="text-2xl font-bold text-white font-mono">{moves}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl px-5 py-2 text-center">
                        <div className="text-xs text-purple-300">OPTIMAL</div>
                        <div className="text-2xl font-bold text-white font-mono">{MIN_MOVES}</div>
                    </div>
                    <button onClick={startNew} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                </div>

                {/* Pegs */}
                <div className="flex justify-around items-end gap-4 mb-4" style={{ height: `${maxH * 44}px` }}>
                    {pegs.map((peg, pi) => (
                        <div
                            key={pi}
                            onClick={() => handlePegClick(pi)}
                            className={`flex flex-col items-center justify-end cursor-pointer rounded-xl p-3 transition-all ${selected === pi ? 'bg-yellow-400/20 ring-2 ring-yellow-400' : 'bg-white/5 hover:bg-white/10'}`}
                            style={{ width: '30%', height: '100%' }}
                        >
                            {/* pole */}
                            <div className="relative flex flex-col items-center justify-end w-full" style={{ height: `${maxH * 36}px` }}>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 bg-purple-400/60 rounded-full" style={{ height: `${maxH * 36}px` }} />
                                {/* disks (sorted bottom→top visually) */}
                                {peg.map((disk, di) => {
                                    const width = `${40 + disk * 14}%`;
                                    return (
                                        <div
                                            key={disk}
                                            className={`relative z-10 rounded-lg ${COLORS[disk]} transition-all duration-200 mb-0.5`}
                                            style={{ width, height: 28, minWidth: 28 }}
                                        >
                                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">{disk + 1}</span>
                                        </div>
                                    );
                                })}
                                {/* base */}
                                <div className="relative z-10 w-full h-3 bg-purple-400/60 rounded-full mt-0.5" />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Peg {pi + 1}</p>
                        </div>
                    ))}
                </div>

                {selected !== null && (
                    <p className="text-center text-yellow-300 text-sm">Disk selected from Peg {selected + 1} — click target peg</p>
                )}
            </div>

            {won && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-10 text-center border border-purple-500 shadow-2xl max-w-sm w-full mx-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Puzzle Solved!</h2>
                        <p className="text-gray-300 mb-1">Moves: <span className="text-yellow-400 font-bold">{moves}</span> / Optimal: <span className="text-green-400 font-bold">{MIN_MOVES}</span></p>
                        <p className="text-gray-400 text-sm mb-6">{moves === MIN_MOVES ? '🏆 Perfect solution!' : 'Great job!'}</p>
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

export default TowerOfHanoi;
