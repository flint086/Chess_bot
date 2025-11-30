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
        
        const user = webApp.initDataUnsafe.user;
        if (user) {
            this.showUserWelcome(user);
        }
    }

    showUserWelcome(user) {
        const welcomeElement = document.createElement('div');
        welcomeElement.className = 'telegram-welcome';
        welcomeElement.innerHTML = `👋 Привет, ${user.first_name}! Добро пожаловать в шахматы! 🎮`;
        
        const container = document.querySelector('.container');
        if (container) {
            const header = container.querySelector('header');
            if (header) {
                header.parentNode.insertBefore(welcomeElement, header.nextSibling);
            }
        }
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

    setButtonText(text) {
        if (this.isTelegram && Telegram.WebApp) {
            Telegram.WebApp.MainButton.setText(text);
        }
    }
}

const telegramApp = new TelegramIntegration();

class ChessGame {
    constructor() {
        this.chess = new Chess();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.isPlayerTurn = true;
        this.movesHistory = [];
        this.boardFlipped = false;
        this.useLetters = false; // Флаг для использования букв вместо символов
        
        this.checkSymbolSupport();
        this.initializeBoard();
        this.bindEvents();
        this.updateGame();
        this.setupTelegramIntegration();
    }

    checkSymbolSupport() {
        // Проверяем поддержку Unicode символов
        const testSymbol = '♔';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = '16px Arial';
        const metrics = ctx.measureText(testSymbol);
        
        // Если символ не отображается (ширина 0), используем буквы
        if (metrics.width === 0) {
            this.useLetters = true;
            console.log('Unicode symbols not supported, using letters');
        }
    }

    setupTelegramIntegration() {
        const originalUpdateStatus = this.updateStatus;
        this.updateStatus = () => {
            originalUpdateStatus.call(this);
            
            if (this.chess.game_over()) {
                telegramApp.setButtonText("🎮 Новая игра");
                telegramApp.showMainButton();
            } else {
                telegramApp.hideMainButton();
            }
        };
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

    updatePieces() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.textContent = '';
            square.classList.remove('check');
            square.style.backgroundImage = 'none';
        });
        
        this.chess.board().forEach((piece, index) => {
            if (piece) {
                const squareName = this.getSquareName(index);
                const squareElement = document.querySelector(`[data-square="${squareName}"]`);
                if (squareElement) {
                    this.renderPiece(squareElement, piece);
                }
            }
        });

        if (this.chess.in_check()) {
            const kingColor = this.chess.turn();
            const kingSquare = this.findKingSquare(kingColor);
            if (kingSquare) {
                const kingElement = document.querySelector(`[data-square="${kingSquare}"]`);
                kingElement.classList.add('check');
            }
        }
    }

    renderPiece(squareElement, piece) {
        if (this.useLetters) {
            // Используем буквы если символы не поддерживаются
            const letterPieces = {
                'p': 'p', 'r': 'r', 'n': 'n', 'b': 'b', 'q': 'q', 'k': 'k',
                'P': 'P', 'R': 'R', 'N': 'N', 'B': 'B', 'Q': 'Q', 'K': 'K'
            };
            squareElement.textContent = letterPieces[piece.type];
            squareElement.style.color = piece.color === 'w' ? '#2c3e50' : '#2c3e50';
            squareElement.style.fontWeight = 'bold';
            squareElement.style.fontSize = '24px';
        } else {
            // Используем Unicode символы
            const symbols = {
                'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
                'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
            };
            squareElement.textContent = symbols[piece.type];
            squareElement.style.color = piece.color === 'w' ? '#2c3e50' : '#2c3e50';
        }
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

        if (telegramApp.isTelegram) {
            document.getElementById('surrender').style.display = 'none';
        }
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
        
        this.updatePieces();
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
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
        
        const moves = this.chess.moves();
        if (moves.length > 0) {
            let bestMoves = moves.filter(move => 
                move.includes('+') || move.includes('x')
            );
            
            if (bestMoves.length === 0) {
                bestMoves = moves.filter(move => !move.includes('-'));
            }
            
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
                    '⚡ Мат! Победил бот! 🤖' : '⚡ Мат! Победили белые! 🎉';
                statusElement.style.color = '#d32f2f';
            } else if (this.chess.in_draw()) {
                statusElement.textContent = '🤝 Ничья!';
                statusElement.style.color = '#ff9800';
            } else if (this.chess.in_stalemate()) {
                statusElement.textContent = '🤝 Пат! Ничья!';
                statusElement.style.color = '#ff9800';
            }
            
            if (telegramApp.isTelegram) {
                telegramApp.setButtonText("🔄 Новая игра");
                telegramApp.showMainButton();
            }
        } else {
            statusElement.textContent = this.isPlayerTurn ? 
                '✅ Ваш ход' : '🤖 Думает бот...';
            statusElement.style.color = '#2e7d32';
        }
        
        turnElement.textContent = `Ход: ${this.chess.turn() === 'w' ? '⚪ Белые' : '⚫ Черные'}`;
        
        if (telegramApp.isTelegram) {
            document.title = this.chess.game_over() ? 
                'Шахматы - Игра завершена' : 
                `Шахматы - ${this.isPlayerTurn ? 'Ваш ход' : 'Ход бота'}`;
        }
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
        
        movesList.scrollTop = movesList.scrollHeight;
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
        telegramApp.hideMainButton();
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
            document.getElementById('status').style.color = '#f44336';
        }
    }
}

// Стили для лучшего отображения
const telegramStyles = `
    .square {
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .square.letter-piece {
        font-size: 24px;
        font-weight: bold;
    }
    
    .telegram-welcome {
        text-align: center; 
        margin: 10px 0; 
        padding: 12px; 
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-radius: 10px;
        font-weight: bold;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .legal-capture {
        background: #ff6b6b !important;
        border: 2px solid #d32f2f;
    }
    
    @media (max-width: 400px) {
        .chess-board {
            grid-template-columns: repeat(8, 35px) !important;
            grid-template-rows: repeat(8, 35px) !important;
        }
        
        .square {
            width: 35px !important;
            height: 35px !important;
            font-size: 20px !important;
        }
        
        .square.letter-piece {
            font-size: 18px !important;
        }
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = telegramStyles;
document.head.appendChild(styleSheet);

document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
    
    if (telegramApp.isTelegram) {
        const surrenderBtn = document.getElementById('surrender');
        if (surrenderBtn) {
            surrenderBtn.style.display = 'none';
        }
        document.body.style.padding = '10px';
    }
});
