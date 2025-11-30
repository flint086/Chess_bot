class ChessGame {
    constructor() {
        this.chess = new Chess();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.isPlayerTurn = true;
        this.movesHistory = [];
        this.boardFlipped = false;
        
        this.initializeBoard();
        this.bindEvents();
        this.updateGame();
    }

    initializeBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            const row = Math.floor(i / 8);
            const col = i % 8;
            
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.square = this.getSquareName(i);
            
            board.appendChild(square);
        }
        
        this.updatePieces();
    }

    getSquareName(index) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const row = Math.floor(index / 8);
        const col = index % 8;
        
        if (this.boardFlipped) {
            return files[7 - col] + ranks[7 - row];
        }
        return files[col] + ranks[row];
    }

    getSquareIndex(squareName) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const file = squareName[0];
        const rank = squareName[1];
        
        let fileIndex = files.indexOf(file);
        let rankIndex = ranks.indexOf(rank);
        
        if (this.boardFlipped) {
            fileIndex = 7 - fileIndex;
            rankIndex = 7 - rankIndex;
        }
        
        return rankIndex * 8 + fileIndex;
    }

    updatePieces() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => square.textContent = '');
        
        this.chess.board().forEach((piece, index) => {
            if (piece) {
                const squareName = this.getSquareName(index);
                const squareElement = document.querySelector(`[data-square="${squareName}"]`);
                if (squareElement) {
                    squareElement.textContent = this.getPieceEmoji(piece);
                }
            }
        });

        // Подсветка шаха
        if (this.chess.in_check()) {
            const kingColor = this.chess.turn();
            const kingSquare = this.findKingSquare(kingColor);
            if (kingSquare) {
                const kingElement = document.querySelector(`[data-square="${kingSquare}"]`);
                kingElement.classList.add('check');
            }
        }
    }

    getPieceEmoji(piece) {
        const pieces = {
            'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
            'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
        };
        return pieces[piece.type] || '';
    }

    findKingSquare(color) {
        const board = this.chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'k' && piece.color === color) {
                    const files = 'abcdefgh';
                    const ranks = '87654321';
                    return files[j] + ranks[i];
                }
            }
        }
        return null;
    }

    bindEvents() {
        document.getElementById('newGame').addEventListener('click', () => this.newGame());
        document.getElementById('flipBoard').addEventListener('click', () => this.flipBoard());
        document.getElementById('surrender').addEventListener('click', () => this.surrender());
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('square')) {
                this.handleSquareClick(e.target.dataset.square);
            }
        });
    }

    handleSquareClick(squareName) {
        if (!this.isPlayerTurn) return;
        
        const piece = this.chess.get(squareName);
        
        // Если выбрана своя фигура
        if (piece && piece.color === 'w') {
            this.selectedSquare = squareName;
            this.legalMoves = this.chess.moves({ square: squareName, verbose: true });
            this.highlightLegalMoves();
        }
        // Если выбрана клетка для хода
        else if (this.selectedSquare && this.legalMoves.some(move => move.to === squareName)) {
            this.makeMove(this.selectedSquare, squareName);
        }
        // Сброс выбора
        else {
            this.clearSelection();
        }
        
        this.updatePieces();
    }

    highlightLegalMoves() {
        this.clearHighlights();
        
        const selectedElement = document.querySelector(`[data-square="${this.selectedSquare}"]`);
        selectedElement.classList.add('selected');
        
        this.legalMoves.forEach(move => {
            const squareElement = document.querySelector(`[data-square="${move.to}"]`);
            squareElement.classList.add('legal-move');
        });
    }

    clearHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'legal-move', 'check');
        });
    }

    clearSelection() {
        this.selectedSquare = null;
        this.legalMoves = [];
        this.clearHighlights();
    }

    async makeMove(from, to) {
        try {
            const move = this.chess.move({ from, to, promotion: 'q' });
            
            if (move) {
                this.movesHistory.push(move.san);
                this.updateMovesList();
                this.clearSelection();
                this.updateGame();
                
                // Ход бота
                if (!this.chess.game_over() && this.chess.turn() === 'b') {
                    this.isPlayerTurn = false;
                    await this.makeBotMove();
                }
            }
        } catch (e) {
            console.error('Invalid move:', e);
        }
    }

    async makeBotMove() {
        // Имитация задержки для "думающего" бота
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const moves = this.chess.moves();
        if (moves.length > 0) {
            // Простой ИИ: предпочитает шах и взятия
            let bestMoves = moves.filter(move => 
                move.includes('+') || move.includes('x')
            );
            
            if (bestMoves.length === 0) {
                bestMoves = moves;
            }
            
            const randomMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
            this.chess.move(randomMove);
            this.movesHistory.push(randomMove);
            this.updateMovesList();
        }
        
        this.isPlayerTurn = true;
        this.updateGame();
    }

    updateGame() {
        this.updatePieces();
        this.updateStatus();
    }

    updateStatus() {
        const statusElement = document.getElementById('status');
        const turnElement = document.getElementById('turn');
        
        if (this.chess.game_over()) {
            if (this.chess.in_checkmate()) {
                statusElement.textContent = this.chess.turn() === 'w' ? 
                    '⚡ Мат! Победил бот!' : '⚡ Мат! Победили белые!';
            } else if (this.chess.in_draw()) {
                statusElement.textContent = '🤝 Ничья!';
            } else if (this.chess.in_stalemate()) {
                statusElement.textContent = '🤝 Пат! Ничья!';
            }
        } else {
            statusElement.textContent = this.isPlayerTurn ? 
                '✅ Ваш ход' : '🤖 Думает бот...';
        }
        
        turnElement.textContent = `Ход: ${this.chess.turn() === 'w' ? 'Белые' : 'Черные'}`;
    }

    updateMovesList() {
        const movesList = document.getElementById('movesList');
        movesList.innerHTML = '';
        
        for (let i = 0; i < this.movesHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.movesHistory[i];
            const blackMove = this.movesHistory[i + 1] || '';
            
            const moveElement = document.createElement('div');
            moveElement.className = 'move-number';
            moveElement.textContent = `${moveNumber}. ${whiteMove} ${blackMove}`;
            movesList.appendChild(moveElement);
        }
    }

    newGame() {
        this.chess.reset();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.isPlayerTurn = true;
        this.movesHistory = [];
        this.clearHighlights();
        this.updateGame();
        this.updateMovesList();
    }

    flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        this.initializeBoard();
        this.updateGame();
    }

    surrender() {
        if (confirm('Сдаться?')) {
            this.chess.reset();
            this.newGame();
            document.getElementById('status').textContent = '🏳️ Вы сдались!';
        }
    }
}

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});