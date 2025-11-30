// Telegram Web App Integration
class TelegramIntegration {
    constructor() {
        this.isTelegram = false;
        this.init();
    }

    init() {
        if (window.Telegram && Telegram.WebApp) {
            this.isTelegram = true;
            this.setupTelegram();
        }
    }

    setupTelegram() {
        const webApp = Telegram.WebApp;
        webApp.expand();
        webApp.enableClosingConfirmation();
        
        webApp.MainButton.setText("🔄 Новая игра");
        webApp.MainButton.color = "#4CAF50";
        webApp.MainButton.hide();
        
        webApp.MainButton.onClick(() => {
            window.location.reload();
        });
    }

    showMainButton() {
        if (this.isTelegram && Telegram.WebApp) {
            Telegram.WebApp.MainButton.show();
        }
    }

    hideMainButton() {
        if (this.isTelegram && Telegram.WebApp) {
            Telegram.WebApp.MainButton.hide();
        }
    }
}

const telegramApp = new TelegramIntegration();

// ШАХМАТНАЯ ИГРА
class ChessGame {
    constructor() {
        this.chess = new Chess();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.isPlayerTurn = true;
        this.movesHistory = [];
        
        this.initializeBoard();
        this.bindEvents();
        this.updateGame();
    }

    initializeBoard() {
        const board = document.getElementById('board');
        if (!board) {
            console.error('Board element not found!');
            return;
        }
        
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
        return files[col] + ranks[row];
    }

    updatePieces() {
        console.log('Updating pieces...');
        
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.textContent = '';
            square.classList.remove('check', 'selected', 'legal-move', 'legal-capture');
        });
        
        const board = this.chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece) {
                    const squareName = this.getSquareName(i * 8 + j);
                    const squareElement = document.querySelector(`[data-square="${squareName}"]`);
                    if (squareElement) {
                        squareElement.textContent = this.getPieceSymbol(piece);
                        console.log(`Set ${piece.type}${piece.color} at ${squareName}: ${squareElement.textContent}`);
                    }
                }
            }
        }

        if (this.chess.in_check()) {
            const kingColor = this.chess.turn();
            const kingSquare = this.findKingSquare(kingColor);
            if (kingSquare) {
                const kingElement = document.querySelector(`[data-square="${kingSquare}"]`);
                kingElement.classList.add('check');
            }
        }
    }

    getPieceSymbol(piece) {
        const symbols = {
            'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
            'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
        };
        return symbols[piece.type] || '?';
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
        
        if (piece && piece.color === 'w') {
            this.selectedSquare = squareName;
            this.legalMoves = this.chess.moves({ square: squareName, verbose: true });
            this.highlightLegalMoves();
        }
        else if (this.selectedSquare && this.legalMoves.some(move => move.to === squareName)) {
            this.makeMove(this.selectedSquare, squareName);
        }
        else {
            this.clearSelection();
        }
    }

    highlightLegalMoves() {
        this.clearHighlights();
        
        const selectedElement = document.querySelector(`[data-square="${this.selectedSquare}"]`);
        selectedElement.classList.add('selected');
        
        this.legalMoves.forEach(move => {
            const squareElement = document.querySelector(`[data-square="${move.to}"]`);
            if (this.chess.get(move.to)) {
                squareElement.classList.add('legal-capture');
            } else {
                squareElement.classList.add('legal-move');
            }
        });
    }

    clearHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'legal-move', 'legal-capture');
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
        this.updateStatus();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const moves = this.chess.moves();
        if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
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
        
        if (!statusElement || !turnElement) {
            console.error('Status elements not found!');
            return;
        }
        
        if (this.chess.game_over()) {
            if (this.chess.in_checkmate()) {
                statusElement.textContent = 'Мат! Игра окончена.';
            } else {
                statusElement.textContent = 'Ничья!';
            }
        } else {
            statusElement.textContent = this.isPlayerTurn ? 'Ваш ход' : 'Ход бота...';
        }
        
        turnElement.textContent = `Ход: ${this.chess.turn() === 'w' ? 'белые' : 'черные'}`;
    }

    updateMovesList() {
        const movesList = document.getElementById('movesList');
        if (!movesList) return;
        
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
        // Простая реализация переворота доски
        alert('Переворот доски в разработке');
    }

    surrender() {
        if (confirm('Сдаться?')) {
            this.newGame();
            document.getElementById('status').textContent = 'Вы сдались!';
        }
    }
}

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting chess game...');
    new ChessGame();
});
