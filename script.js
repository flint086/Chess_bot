// Telegram Web App Integration
class TelegramIntegration {
    constructor() {
        this.isTelegram = false;
        this.init();
    }

    init() {
        // Проверяем если открыто в Telegram Web App
        if (window.Telegram && Telegram.WebApp) {
            this.isTelegram = true;
            this.setupTelegram();
        }
    }

    setupTelegram() {
        const webApp = Telegram.WebApp;
        
        // Расширяем на весь экран
        webApp.expand();
        
        // Включаем подтверждение закрытия
        webApp.enableClosingConfirmation();
        
        // Настраиваем основную кнопку
        webApp.MainButton.setText("🔄 Новая игра");
        webApp.MainButton.color = "#4CAF50";
        webApp.MainButton.hide();
        
        // Обработчик клика по кнопке
        webApp.MainButton.onClick(() => {
            window.location.reload();
        });
        
        // Получаем данные пользователя
        const user = webApp.initDataUnsafe.user;
        if (user) {
            this.showUserWelcome(user);
        }
        
        console.log('Telegram Web App initialized');
    }

    showUserWelcome(user) {
        const welcomeElement = document.createElement('div');
        welcomeElement.className = 'telegram-welcome';
        welcomeElement.style.cssText = `
            text-align: center; 
            margin: 10px 0; 
            padding: 12px; 
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-radius: 10px;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        `;
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

// Инициализируем Telegram интеграцию
const telegramApp = new TelegramIntegration();

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
        this.setupTelegramIntegration();
    }

    setupTelegramIntegration() {
        // Показываем кнопку Telegram когда игра завершена
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
        squares.forEach(square => {
            square.textContent = '';
            square.classList.remove('check');
        });
        
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

        // Скрываем кнопки управления если в Telegram
        if (telegramApp.isTelegram) {
            document.getElementById('surrender').style.display = 'none';
        }
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
            square.classList.remove('selected', 'legal-move');
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
        // Показываем статус "бот думает"
        this.updateStatus();
        
        // Имитация задержки для "думающего" бота
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
        
        const moves = this.chess.moves();
        if (moves.length > 0) {
            // Простой ИИ: предпочитает шах и взятия
            let bestMoves = moves.filter(move => 
                move.includes('+') || move.includes('x')
            );
            
            // Если нет шахов/взятий, ищем хорошие ходы
            if (bestMoves.length === 0) {
                bestMoves = moves.filter(move => 
                    !move.includes('-') // избегаем пассивных ходов
                );
            }
            
            // Если все ходы плохие, берем случайный
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
            
            // Показываем кнопку новой игры в Telegram
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
        
        // Обновляем заголовок для Telegram
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
        
        // Прокручиваем к последним ходам
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
        
        // Скрываем кнопку Telegram
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

// Стили для Telegram Web App
const telegramStyles = `
    .telegram-welcome {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Адаптация для маленьких экранов Telegram */
    @media (max-width: 400px) {
        .chess-board {
            grid-template-columns: repeat(8, 35px) !important;
            grid-template-rows: repeat(8, 35px) !important;
        }
        
        .square {
            width: 35px !important;
            height: 35px !important;
            font-size: 25px !important;
        }
        
        .controls {
            flex-direction: column;
        }
        
        button {
            width: 100%;
            margin: 2px 0;
        }
    }
`;

// Добавляем стили в документ
const styleSheet = document.createElement("style");
styleSheet.textContent = telegramStyles;
document.head.appendChild(styleSheet);

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
    
    // Скрываем кнопку сдачи если в Telegram
    if (telegramApp.isTelegram) {
        const surrenderBtn = document.getElementById('surrender');
        if (surrenderBtn) {
            surrenderBtn.style.display = 'none';
        }
    }
});

// Обработчик для отправки статистики в Telegram (опционально)
function sendGameResultToTelegram(result) {
    if (telegramApp.isTelegram && Telegram.WebApp) {
        const data = {
            action: 'game_completed',
            result: result,
            moves: document.getElementById('movesList').children.length,
            timestamp: new Date().toISOString()
        };
        
        // Отправляем данные в бота
        Telegram.WebApp.sendData(JSON.stringify(data));
    }
}
