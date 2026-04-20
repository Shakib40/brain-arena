import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

// ── Chess logic ───────────────────────────────────────────────────────────────
const INIT = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];
const PIECES = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟', K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' };
const isBlack = (p) => p && p === p.toLowerCase();
const isWhite = (p) => p && p === p.toUpperCase();
const isEnemy = (a, b) => (isWhite(a) && isBlack(b)) || (isBlack(a) && isWhite(b));
const isFriend = (a, b) => a && b && ((isWhite(a) && isWhite(b)) || (isBlack(a) && isBlack(b)));

const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

const slideMoves = (board, r, c, dirs) => {
    const moves = [];
    for (const [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        while (inBounds(nr, nc)) {
            if (!board[nr][nc]) { moves.push([nr, nc]); }
            else { if (isEnemy(board[r][c], board[nr][nc])) moves.push([nr, nc]); break; }
            nr += dr; nc += dc;
        }
    }
    return moves;
};

const getMoves = (board, r, c) => {
    const p = board[r][c]; if (!p) return [];
    const t = p.toLowerCase();
    const moves = [];
    const add = (nr, nc) => { if (inBounds(nr, nc) && !isFriend(p, board[nr][nc])) moves.push([nr, nc]); };
    if (t === 'p') {
        const dir = isWhite(p) ? -1 : 1;
        const start = isWhite(p) ? 6 : 1;
        if (!board[r + dir]?.[c]) { moves.push([r + dir, c]); if (r === start && !board[r + 2 * dir]?.[c]) moves.push([r + 2 * dir, c]); }
        for (const dc of [-1, 1]) if (board[r + dir]?.[c + dc] && isEnemy(p, board[r + dir][c + dc])) moves.push([r + dir, c + dc]);
    } else if (t === 'n') {
        for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) add(r + dr, c + dc);
    } else if (t === 'b') { return slideMoves(board, r, c, [[-1, -1], [-1, 1], [1, -1], [1, 1]]); }
    else if (t === 'r') { return slideMoves(board, r, c, [[-1, 0], [1, 0], [0, -1], [0, 1]]); }
    else if (t === 'q') { return slideMoves(board, r, c, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]); }
    else if (t === 'k') { for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) add(r + dr, c + dc); }
    return moves;
};

const Chess = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState(() => INIT.map((r) => [...r]));
    const [selected, setSelected] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);
    const [turn, setTurn] = useState('white');
    const [captured, setCaptured] = useState({ white: [], black: [] });
    const [status, setStatus] = useState('');

    const startNew = () => { setBoard(INIT.map((r) => [...r])); setSelected(null); setLegalMoves([]); setTurn('white'); setCaptured({ white: [], black: [] }); setStatus(''); };

    const handleClick = useCallback((r, c) => {
        const p = board[r][c];
        if (selected) {
            const move = legalMoves.find(([mr, mc]) => mr === r && mc === c);
            if (move) {
                const next = board.map((row) => [...row]);
                const captured_piece = next[r][c];
                next[r][c] = next[selected[0]][selected[1]];
                next[selected[0]][selected[1]] = null;
                // pawn promotion
                if (next[r][c] === 'P' && r === 0) next[r][c] = 'Q';
                if (next[r][c] === 'p' && r === 7) next[r][c] = 'q';
                setBoard(next);
                if (captured_piece) setCaptured((prev) => ({ ...prev, [turn]: [...prev[turn], captured_piece] }));
                // check if king captured
                const allPieces = next.flat().filter(Boolean);
                if (!allPieces.includes('k')) setStatus('White wins! ♔');
                if (!allPieces.includes('K')) setStatus('Black wins! ♚');
                setTurn((t) => t === 'white' ? 'black' : 'white');
                setSelected(null); setLegalMoves([]);
                return;
            }
            setSelected(null); setLegalMoves([]);
            if (!p) return;
        }
        if (!p) return;
        if (turn === 'white' && !isWhite(p)) return;
        if (turn === 'black' && !isBlack(p)) return;
        setSelected([r, c]);
        setLegalMoves(getMoves(board, r, c));
    }, [board, selected, legalMoves, turn]);

    const isLight = (r, c) => (r + c) % 2 === 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center">
            <div className="container mx-auto px-4 py-6 max-w-lg">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-4 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center mb-4">
                    <div className="text-4xl mb-1">♟️</div>
                    <h1 className="text-3xl font-bold text-white">Chess</h1>
                    <p className="text-gray-400 text-sm mt-1">Click a piece then click destination</p>
                </div>

                <div className="flex justify-between items-center mb-3">
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${turn === 'black' ? 'bg-gray-800 text-white ring-2 ring-yellow-400' : 'bg-white/10 text-gray-400'}`}>
                        ⬛ Black {captured.black.map((p) => PIECES[p] || '').join('')}
                    </div>
                    <button onClick={startNew} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"><RotateCcw className="w-3 h-3 inline mr-1" />Reset</button>
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${turn === 'white' ? 'bg-white text-gray-900 ring-2 ring-yellow-400' : 'bg-white/10 text-gray-400'}`}>
                        ⬜ White {captured.white.map((p) => PIECES[p] || '').join('')}
                    </div>
                </div>

                {status && <p className="text-center text-yellow-400 font-bold text-lg mb-3">🏆 {status}</p>}

                {/* Board */}
                <div className="grid grid-cols-8 rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-2xl" style={{ aspectRatio: '1' }}>
                    {board.map((row, r) => row.map((cell, c) => {
                        const isSel = selected?.[0] === r && selected?.[1] === c;
                        const isMove = legalMoves.some(([mr, mc]) => mr === r && mc === c);
                        const base = isLight(r, c) ? 'bg-amber-100' : 'bg-amber-800';
                        return (
                            <div key={`${r}-${c}`} onClick={() => !status && handleClick(r, c)}
                                className={`flex items-center justify-center cursor-pointer select-none relative text-2xl transition-colors
                  ${base} ${isSel ? 'ring-4 ring-inset ring-yellow-400' : ''} ${status ? 'cursor-default' : ''}`}>
                                {isMove && <div className={`absolute ${cell ? 'inset-0 ring-4 ring-inset ring-green-400 rounded' : 'w-3 h-3 rounded-full bg-green-500/60'}`} />}
                                <span className={isBlack(cell) ? 'text-gray-900 drop-shadow-sm' : 'text-white drop-shadow'}>{cell ? PIECES[cell] : ''}</span>
                            </div>
                        );
                    }))}
                </div>

                <div className="flex gap-2 mt-3 text-xs text-gray-500 justify-center">
                    <span>Files: a–h (left→right)</span>·<span>Ranks: 8–1 (top→bottom)</span>
                </div>
            </div>
        </div>
    );
};

export default Chess;
