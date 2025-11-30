// == ШАХМАТЫ В TELEGRAM ==
// Версия: 1.0.0
// Автор: ChessBot
// Дата: 2024

// Telegram Web App Integration
class TelegramIntegration {
    constructor() {
        this.isTelegram = false;
        this.version = "1.0.0";
        this.init();
    }

    init() {
        if (window.Telegram && Telegram.WebApp) {
            this.isTelegram = true;
            this.setupTelegram();
        }
        this.displayVersion();
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

    displayVersion() {
        // Создаем элемент для отображения версии
        const versionElement = document.createElement('div');
        versionElement.id = 'app-version';
        versionElement.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            pointer-events: none;
        `;
        versionElement.textContent = `v${this.version}`;
        document.body.appendChild(versionElement);
        
        console.log(`♟️ Chess Bot v${this.version} initialized`);
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
        this.difficulty = 'medium'; // easy, medium, hard
        this.botThinkingTime = 800; // базовое время思考
        
        this.initializeBoard();
        this.bindEvents();
        this.createDifficultySelector();
        this.updateGame();
    }

    createDifficultySelector() {
        const controls = document.querySelector('.controls');
        if (!controls) return;

        const difficultyDiv = document.createElement('div');
        difficultyDiv.className = 'difficulty-selector';
        difficultyDiv.style.margin = '10px 0';
        difficultyDiv.style.textAlign = 'center';
        
        difficultyDiv.innerHTML = `
            <label style="margin-right: 10px;">Уровень:</label>
            <select id="difficulty" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc;">
                <option value="easy">🤖 Легкий</option>
                <option value="medium" selected>🎯 Средний</option>
                <option value="hard">🔥 Сложный</option>
            </select>
        `;
        
        controls.parentNode.insertBefore(difficultyDiv, controls);
        
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateThinkingTime();
        });
    }

    updateThinkingTime() {
        switch(this.difficulty) {
            case 'easy':
                this.botThinkingTime = 500;
                break;
            case 'medium':
                this.botThinkingTime = 800;
                break;
            case 'hard':
                this.botThinkingTime = 1200;
                break;
        }
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
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.textContent = '';
            square.classList.remove('check', 'selected', 'legal-move', 'legal-capture');
            square.style.color = '';
            square.style.textShadow = '';
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
                        squareElement.style.color = piece.color === 'w' ? '#FFFFFF' : '#000000';
                        if (piece.color === 'w') {
                            squareElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
                        } else {
                            squareElement.style.textShadow = '1px 1px 2px rgba(255,255,255,0.3)';
                        }
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
            let promotion = null;
        
            // Проверяем превращение пешки
            const piece = this.chess.get(from);
            if (piece && piece.type === 'p') {
                const targetRank = to[1]; // цифра (1 или 8)
                if ((piece.color === 'w' && targetRank === '8') || 
                    (piece.color === 'b' && targetRank === '1')) {
                    // Пешка дошла до конца - выбираем ферзя
                    promotion = 'q';
                }
            }
        
            const moveConfig = { from, to };
            if (promotion) {
                moveConfig.promotion = promotion;
            }
        
            const move = this.chess.move(moveConfig);
        
            if (move) {
                this.movesHistory.push(move.san);
                this.updateMovesList();
                this.clearSelection();
                this.updateGame();
            
                if (!this.chess.game_over() && this.chess.turn() === 'b') {
                    this.isPlayerTurn = false;
                    await this.makeBotMove();
                }
            } else {
                console.error('Invalid move attempted:', from, to);
                this.clearSelection();
            }
        } catch (e) {
            console.error('Invalid move:', e);
            this.clearSelection();
        }
    }

    async makeBotMove() {
        this.updateStatus();
    
        try {
            await new Promise(resolve => setTimeout(resolve, this.botThinkingTime));
            
            // Получаем все возможные ходы
            const moves = this.chess.moves({ verbose: true });
            
            if (moves.length === 0) {
                console.log('No moves available for bot');
                this.isPlayerTurn = true;
                this.updateGame();
                return;
            }
            
            // Ищем ходы с превращением пешки
            const promotionMoves = [];
            const regularMoves = [];
            
            moves.forEach(move => {
                const piece = this.chess.get(move.from);
                if (piece && piece.type === 'p') {
                    const targetRank = move.to[1];
                    // Пешка бота (черные) доходит до 1-й горизонтали
                    if (piece.color === 'b' && targetRank === '1') {
                        promotionMoves.push(move);
                        return;
                    }
                    // Пешка игрока (белые) доходит до 8-й горизонтали  
                    if (piece.color === 'w' && targetRank === '8') {
                        promotionMoves.push(move);
                        return;
                    }
                }
                regularMoves.push(move);
            });
            
            let selectedMove;
            
            // Если есть ходы с превращением, обрабатываем их отдельно
            if (promotionMoves.length > 0) {
                selectedMove = this.handlePromotionMoves(promotionMoves);
            } else {
                // Обычные ходы
                selectedMove = this.getBestMove(regularMoves.length > 0 ? regularMoves : moves);
            }
            
            // Выполняем ход
            if (selectedMove) {
                const moveResult = this.chess.move(selectedMove);
                if (moveResult) {
                    this.movesHistory.push(moveResult.san);
                    this.updateMovesList();
                } else {
                    throw new Error('Invalid move selected by bot');
                }
            } else {
                // Если не удалось выбрать ход, берем первый доступный
                const fallbackMove = this.createMoveObject(moves[0]);
                this.chess.move(fallbackMove);
            }
            
        } catch (error) {
            console.error('Error in bot move:', error);
            // Экстренное восстановление - пробуем любой ход
            try {
                const moves = this.chess.moves({ verbose: true });
                if (moves.length > 0) {
                    const randomMove = this.createMoveObject(moves[0]);
                    this.chess.move(randomMove);
                }
            } catch (fallbackError) {
                console.error('Emergency recovery failed:', fallbackError);
            }
        }
    
        this.isPlayerTurn = true;
        this.updateGame();
    }

    handlePromotionMoves(promotionMoves) {
        // Для ходов с превращением всегда выбираем ферзя (самый сильный вариант)
        const bestPromotionMove = promotionMoves[0];
        return {
            from: bestPromotionMove.from,
            to: bestPromotionMove.to,
            promotion: 'q' // Всегда ферзь
        };
    }

    createMoveObject(move) {
        // Создает безопасный объект хода
        const moveObj = {
            from: move.from,
            to: move.to
        };
        
        // Добавляем превращение только если это действительно превращение пешки
        const piece = this.chess.get(move.from);
        if (piece && piece.type === 'p') {
            const targetRank = move.to[1];
            if ((piece.color === 'b' && targetRank === '1') || 
                (piece.color === 'w' && targetRank === '8')) {
                moveObj.promotion = 'q'; // Всегда ферзь для простоты
            }
        }
        
        return moveObj;
    }

    getBestMove(moves) {
        if (moves.length === 0) return null;
        
        switch(this.difficulty) {
            case 'easy':
                return this.createMoveObject(this.getEasyMove(moves));
            case 'medium':
                return this.createMoveObject(this.getMediumMove(moves));
            case 'hard':
                return this.createMoveObject(this.getHardMove(moves));
            default:
                return this.createMoveObject(this.getMediumMove(moves));
        }
    }

    getEasyMove(moves) {
        // Легкий уровень - случайные ходы, иногда ошибается
        let goodMoves = moves.filter(move => 
            !move.san.includes('+') && // избегает шахи
            !move.san.includes('x')    // избегает взятия
        );
        
        if (goodMoves.length === 0) goodMoves = moves;
        
        // 30% chance сделать плохой ход
        if (Math.random() < 0.3) {
            const badMoves = moves.filter(move => 
                move.san.includes('??') || // очень плохие ходы
                this.isBadMove(move)
            );
            if (badMoves.length > 0) {
                return badMoves[Math.floor(Math.random() * badMoves.length)];
            }
        }
        
        return goodMoves[Math.floor(Math.random() * goodMoves.length)];
    }

    getMediumMove(moves) {
        // Средний уровень - предпочитает хорошие ходы
        let bestMoves = moves.filter(move => 
            move.san.includes('+') || // шахи
            move.san.includes('x') || // взятия
            (move.flags && move.flags.includes('c'))  // взятия
        );
        
        if (bestMoves.length === 0) {
            bestMoves = moves.filter(move => 
                !this.isBadMove(move) // избегает плохих ходов
            );
        }
        
        if (bestMoves.length === 0) bestMoves = moves;
        
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    getHardMove(moves) {
        // Сложный уровень - умная стратегия
        let bestMoves = [];
        
        // 1. Приоритет - матовые атаки
        bestMoves = moves.filter(move => 
            move.san.includes('#') || // мат
            move.san.includes('+')    // шах
        );
        
        // 2. Приоритет - взятия фигур
        if (bestMoves.length === 0) {
            bestMoves = moves.filter(move => 
                move.san.includes('x') || // взятия
                (move.flags && move.flags.includes('c'))  // взятия
            );
            
            // Сортировка взятий по ценности
            bestMoves.sort((a, b) => this.getCaptureValue(b) - this.getCaptureValue(a));
        }
        
        // 3. Развитие фигур и контроль центра
        if (bestMoves.length === 0) {
            bestMoves = moves.filter(move => 
                this.isGoodPositionalMove(move)
            );
        }
        
        // 4. Любой ход
        if (bestMoves.length === 0) {
            bestMoves = moves.filter(move => 
                !this.isBadMove(move)
            );
        }
        
        if (bestMoves.length === 0) bestMoves = moves;
        
        return bestMoves[Math.floor(Math.random() * Math.min(bestMoves.length, 3))];
    }

    isBadMove(move) {
        // Определяет явно плохие ходы
        const badSquares = ['a3', 'h3', 'a6', 'h6']; // плохие для пешек
        const piece = this.chess.get(move.from);
        
        if (piece && piece.type === 'p') {
            if (badSquares.includes(move.to)) return true;
        }
        
        return move.san.includes('??') || // очень плохие ходы
               (move.san.includes('?') && Math.random() < 0.7); // 70% избегать сомнительных
    }

    isGoodPositionalMove(move) {
        // Хорошие позиционные ходы
        const centerSquares = ['d4', 'e4', 'd5', 'e5', 'c3', 'f3', 'c6', 'f6'];
        const developmentSquares = ['c3', 'f3', 'c6', 'f6', 'd2', 'e2', 'd7', 'e7'];
        
        if (centerSquares.includes(move.to)) return true;
        if (developmentSquares.includes(move.to)) return true;
        
        return false;
    }

    getCaptureValue(move) {
        // Ценность взятия
        const pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };
        
        const capturedPiece = this.chess.get(move.to);
        if (capturedPiece) {
            return pieceValues[capturedPiece.type] || 0;
        }
        return 0;
    }

    updateGame() {
        this.updatePieces();
        this.updateStatus();
    }

    updateStatus() {
        const statusElement = document.getElementById('status');
        const turnElement = document.getElementById('turn');
        
        if (!statusElement || !turnElement) return;
        
        const difficultyNames = {
            'easy': '🤖 Легкий',
            'medium': '🎯 Средний', 
            'hard': '🔥 Сложный'
        };
        
        if (this.chess.game_over()) {
            if (this.chess.in_checkmate()) {
                statusElement.textContent = this.chess.turn() === 'w' ? 
                    'Мат! Черные выиграли.' : 'Мат! Белые выиграли.';
            } else {
                statusElement.textContent = 'Ничья!';
            }
        } else {
            statusElement.textContent = this.isPlayerTurn ? 
                `Ваш ход (${difficultyNames[this.difficulty]})` : 
                `Ход бота (${difficultyNames[this.difficulty]})...`;
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
