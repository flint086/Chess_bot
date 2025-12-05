// == ШАХМАТЫ В TELEGRAM ==
// Версия: 2.2.1
// Автор: ChessBot
// Дата: 2024
// История версий:
// 1.0.0 - Базовая версия игры
// 1.1.0 - Исправлено зависание бота при превращении пешек
// 1.1.1 - Добавлена система версий и защита от кеширования
// 1.2.0 - Добавлено автосохранение игры
// 1.2.1 - Исправлено зависание при загрузке сохраненной игры
// 2.0.0 - Добавлен режим игры для двух игроков
// 2.1.0 - Улучшен режим двух игроков: автоматическое определение чей ход
// 2.1.1 - Исправлена прокрутка страницы после хода
// 2.1.2 - Исправлена блокировка ходов фигур
// 2.1.3 - Исправлен переход между режимами игры
// 2.2.0 - Добавлен новый уровень сложности "Эксперт"
// 2.2.1 - Исправлено отображение доски и выбор сложности

// Telegram Web App Integration
class TelegramIntegration {
    constructor() {
        this.isTelegram = false;
        this.version = "2.2.1";
        this.versionHistory = {
            "1.0.0": "Базовая версия игры",
            "1.1.0": "Исправлено зависание бота при превращении пешек", 
            "1.1.1": "Добавлена система версий и защита от кеширования",
            "1.2.0": "Добавлено автосохранение игры",
            "1.2.1": "Исправлено зависание при загрузке сохраненной игры",
            "2.0.0": "Добавлен режим игры для двух игроков",
            "2.1.0": "Улучшен режим двух игроков: автоматическое определение чей ход",
            "2.1.1": "Исправлена прокрутка страницы после хода",
            "2.1.2": "Исправлена блокировка ходов фигур",
            "2.1.3": "Исправлен переход между режимами игры",
            "2.2.0": "Добавлен новый уровень сложности 'Эксперт'",
            "2.2.1": "Исправлено отображение доски и выбор сложности"
        };
        this.buildDate = new Date().toISOString().split('T')[0];
        this.init();
    }

    init() {
        this.clearCache();
        if (window.Telegram && Telegram.WebApp) {
            this.isTelegram = true;
            this.setupTelegram();
        }
        this.displayVersion();
    }

    clearCache() {
        if (performance && performance.navigation && performance.navigation.type === 1) {
            console.log('🔄 Страница была перезагружена - очищаем кеш');
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

        webApp.onEvent('viewportChanged', this.saveGameState.bind(this));
        webApp.onEvent('closing', this.saveGameState.bind(this));
    }

    saveGameState() {
        if (window.chessGame) {
            window.chessGame.saveGame();
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

    displayVersion() {
        const oldVersion = document.getElementById('app-version');
        if (oldVersion) {
            oldVersion.remove();
        }

        const versionElement = document.createElement('div');
        versionElement.id = 'app-version';
        versionElement.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 6px 10px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            cursor: pointer;
            border: 2px solid #4CAF50;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        versionElement.title = `Версия ${this.version}\nНажмите для подробной информации`;
        versionElement.innerHTML = `v${this.version} <span style="color: #4CAF50;">●</span>`;
        
        versionElement.addEventListener('click', () => {
            this.showVersionInfo();
        });
        
        versionElement.addEventListener('mouseenter', () => {
            versionElement.style.background = 'rgba(0,0,0,0.9)';
        });
        
        versionElement.addEventListener('mouseleave', () => {
            versionElement.style.background = 'rgba(0,0,0,0.8)';
        });
        
        document.body.appendChild(versionElement);
        
        console.log(`%c♟️ Chess Bot v${this.version}`, 'color: #4CAF50; font-weight: bold; font-size: 14px;');
        console.log(`%c📝 ${this.versionHistory[this.version]}`, 'color: #888;');
        console.log(`%c🏗️ Сборка: ${this.buildDate}`, 'color: #888;');
        
        this.showVersionNotification();
    }

    showVersionInfo() {
        let infoText = `♟️ Шахматы в Telegram\n\n`;
        infoText += `Версия: ${this.version}\n`;
        infoText += `Сборка: ${this.buildDate}\n\n`;
        infoText += `История изменений:\n`;
        
        const versions = Object.keys(this.versionHistory).sort((a, b) => {
            const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
            const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
            return (bMajor - aMajor) || (bMinor - aMinor) || (bPatch - aPatch);
        });
        
        for (const version of versions) {
            infoText += `\n${version} - ${this.versionHistory[version]}`;
        }
        
        alert(infoText);
    }

    showVersionNotification() {
        const lastSeenVersion = localStorage.getItem('lastSeenVersion');
        
        if (!lastSeenVersion || lastSeenVersion !== this.version) {
            setTimeout(() => {
                console.log(`%c🆕 Загружена новая версия! v${this.version}`, 'color: #FF9800; font-weight: bold;');
            }, 1000);
            
            localStorage.setItem('lastSeenVersion', this.version);
        }
    }

    updateVersion(newVersion, description) {
        this.version = newVersion;
        this.versionHistory[newVersion] = description;
        this.buildDate = new Date().toISOString().split('T')[0];
        this.displayVersion();
        
        console.log(`%c🔄 Версия обновлена до v${newVersion}`, 'color: #4CAF50; font-weight: bold;');
        console.log(`%c📝 ${description}`, 'color: #888;');
    }
}

const telegramApp = new TelegramIntegration();

// ШАХМАТНАЯ ИГРА
class ChessGame {
    constructor() {
        this.chess = new Chess();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.currentPlayer = 'w';
        this.movesHistory = [];
        this.difficulty = 'medium';
        this.botThinkingTime = 800;
        this.isLoading = true;
        this.gameMode = 'vsBot';
        this.isBotThinking = false;
        
        this.initializeBoard();
        this.bindEvents();
        this.createModeSelector();
        this.createDifficultySelector();
        this.loadGame();
        this.updateGame();
        
        window.chessGame = this;
        
        setTimeout(() => {
            this.isLoading = false;
            console.log('✅ Игра полностью загружена');
        }, 500);
    }

    // === ОСНОВНЫЕ МЕТОДЫ ДОСКИ ===
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

    // === СОЗДАНИЕ ИНТЕРФЕЙСА ===
    createModeSelector() {
        const controls = document.querySelector('.controls');
        if (!controls) return;

        const modeDiv = document.createElement('div');
        modeDiv.className = 'mode-selector';
        modeDiv.style.margin = '10px 0';
        modeDiv.style.textAlign = 'center';
        
        modeDiv.innerHTML = `
            <label style="margin-right: 10px;">Режим:</label>
            <select id="gameMode" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc;">
                <option value="vsBot">🤖 Против бота</option>
                <option value="twoPlayers">👥 Два игрока</option>
            </select>
        `;
        
        controls.parentNode.insertBefore(modeDiv, controls);
        
        const modeSelect = document.getElementById('gameMode');
        modeSelect.value = this.gameMode;
        
        modeSelect.addEventListener('change', (e) => {
            const newMode = e.target.value;
            if (newMode !== this.gameMode) {
                this.gameMode = newMode;
                this.handleModeChange();
                this.saveGame();
            }
        });
        
        this.updateModeControls();
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
                <option value="expert">🧠 Эксперт</option>
            </select>
        `;
        
        controls.parentNode.insertBefore(difficultyDiv, controls);
        
        const difficultySelect = document.getElementById('difficulty');
        difficultySelect.value = this.difficulty;
        
        difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateThinkingTime();
            this.saveGame();
        });
        
        this.updateModeControls();
    }

    updateModeControls() {
        const difficultySelector = document.querySelector('.difficulty-selector');
        
        if (this.gameMode === 'vsBot') {
            if (difficultySelector) difficultySelector.style.display = 'block';
        } else {
            if (difficultySelector) difficultySelector.style.display = 'none';
        }
    }

    // === ОБРАБОТКА ХОДОВ ===
    bindEvents() {
        const newGameBtn = document.getElementById('newGame');
        const flipBoardBtn = document.getElementById('flipBoard');
        const surrenderBtn = document.getElementById('surrender');
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.newGame();
            });
        }
        
        if (flipBoardBtn) {
            flipBoardBtn.addEventListener('click', () => {
                this.flipBoard();
            });
        }
        
        if (surrenderBtn) {
            surrenderBtn.addEventListener('click', () => {
                this.surrender();
            });
        }
        
        document.addEventListener('click', (e) => {
            if (this.isLoading || this.isBotThinking) return;
            
            if (e.target.classList.contains('square')) {
                this.handleSquareClick(e.target.dataset.square);
            }
        });
    }

    handleSquareClick(squareName) {
        if (this.isLoading || this.isBotThinking) {
            console.log('⚠️ Ход невозможен: идет загрузка или ход бота');
            return;
        }
        
        const piece = this.chess.get(squareName);
        const currentTurn = this.chess.turn();
        
        if (this.gameMode === 'twoPlayers') {
            if (piece && piece.color === currentTurn) {
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
        else if (this.gameMode === 'vsBot') {
            if (piece && piece.color === 'w' && currentTurn === 'w') {
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
    }

    highlightLegalMoves() {
        this.clearHighlights();
        
        const selectedElement = document.querySelector(`[data-square="${this.selectedSquare}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        this.legalMoves.forEach(move => {
            const squareElement = document.querySelector(`[data-square="${move.to}"]`);
            if (squareElement) {
                if (this.chess.get(move.to)) {
                    squareElement.classList.add('legal-capture');
                } else {
                    squareElement.classList.add('legal-move');
                }
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
        if (this.isBotThinking) return;
        
        try {
            let promotion = null;
        
            const piece = this.chess.get(from);
            if (piece && piece.type === 'p') {
                const targetRank = to[1];
                if ((piece.color === 'w' && targetRank === '8') || 
                    (piece.color === 'b' && targetRank === '1')) {
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
                this.currentPlayer = this.chess.turn();
                this.updateGame();
                this.saveGame();
            
                if (!this.chess.game_over()) {
                    if (this.gameMode === 'vsBot' && this.currentPlayer === 'b') {
                        setTimeout(() => {
                            this.makeBotMove();
                        }, 300);
                    }
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

    // === ЛОГИКА БОТА ===
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
            case 'expert':
                this.botThinkingTime = 1800;
                break;
        }
        this.saveGame();
    }

    async makeBotMove() {
        if (this.isBotThinking || this.chess.game_over()) return;
        
        this.isBotThinking = true;
        console.log('🤖 Бот думает...');
        this.updateStatus();
    
        try {
            await new Promise(resolve => setTimeout(resolve, this.botThinkingTime));
            
            const moves = this.chess.moves({ verbose: true });
            
            if (moves.length === 0) {
                console.log('No moves available for bot');
                this.updateGame();
                this.saveGame();
                this.isBotThinking = false;
                return;
            }
            
            let selectedMove = this.getBestMove(moves);
            
            if (selectedMove) {
                const moveResult = this.chess.move(selectedMove);
                if (moveResult) {
                    this.movesHistory.push(moveResult.san);
                    this.updateMovesList();
                    this.currentPlayer = this.chess.turn();
                    this.saveGame();
                } else {
                    throw new Error('Invalid move selected by bot');
                }
            } else {
                const fallbackMove = this.createMoveObject(moves[0]);
                this.chess.move(fallbackMove);
            }
            
        } catch (error) {
            console.error('Error in bot move:', error);
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
    
        this.currentPlayer = this.chess.turn();
        this.isBotThinking = false;
        this.updateGame();
        this.saveGame();
        console.log('🤖 Ход бота завершен');
    }

    createMoveObject(move) {
        const moveObj = {
            from: move.from,
            to: move.to
        };
        
        const piece = this.chess.get(move.from);
        if (piece && piece.type === 'p') {
            const targetRank = move.to[1];
            if ((piece.color === 'b' && targetRank === '1') || 
                (piece.color === 'w' && targetRank === '8')) {
                moveObj.promotion = 'q';
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
            case 'expert':
                return this.createMoveObject(this.getExpertMove(moves));
            default:
                return this.createMoveObject(this.getMediumMove(moves));
        }
    }

    // === УРОВНИ СЛОЖНОСТИ ===
    getEasyMove(moves) {
        let goodMoves = moves.filter(move => 
            !move.san.includes('+') &&
            !move.san.includes('x')
        );
        
        if (goodMoves.length === 0) goodMoves = moves;
        
        if (Math.random() < 0.3) {
            const badMoves = moves.filter(move => 
                move.san.includes('??') ||
                this.isBadMove(move)
            );
            if (badMoves.length > 0) {
                return badMoves[Math.floor(Math.random() * badMoves.length)];
            }
        }
        
        return goodMoves[Math.floor(Math.random() * goodMoves.length)];
    }

    getMediumMove(moves) {
        let bestMoves = moves.filter(move => 
            move.san.includes('+') ||
            move.san.includes('x') ||
            (move.flags && move.flags.includes('c'))
        );
        
        if (bestMoves.length === 0) {
            bestMoves = moves.filter(move => 
                !this.isBadMove(move)
            );
        }
        
        if (bestMoves.length === 0) bestMoves = moves;
        
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    getHardMove(moves) {
        let bestMoves = [];
        
        bestMoves = moves.filter(move => 
            move.san.includes('#') ||
            move.san.includes('+')
        );
        
        if (bestMoves.length === 0) {
            bestMoves = moves.filter(move => 
                move.san.includes('x') ||
                (move.flags && move.flags.includes('c'))
            );
            
            bestMoves.sort((a, b) => this.getCaptureValue(b) - this.getCaptureValue(a));
        }
        
        if (bestMoves.length === 0) {
            bestMoves = moves.filter(move => 
                this.isGoodPositionalMove(move)
            );
        }
        
        if (bestMoves.length === 0) {
            bestMoves = moves.filter(move => 
                !this.isBadMove(move)
            );
        }
        
        if (bestMoves.length === 0) bestMoves = moves;
        
        return bestMoves[Math.floor(Math.random() * Math.min(bestMoves.length, 3))];
    }

    getExpertMove(moves) {
        console.log('🧠 Эксперт анализирует позицию...');
        
        // 1. Мат в 1 ход
        let bestMoves = moves.filter(move => move.san.includes('#'));
        if (bestMoves.length > 0) {
            console.log('🧠 Эксперт нашел матовый ход!');
            return bestMoves[0];
        }
        
        // 2. Сильные атаки
        bestMoves = moves.filter(move => 
            move.san.includes('+') && this.isStrongAttack(move)
        );
        if (bestMoves.length > 0) {
            console.log('🧠 Эксперт нашел сильную атаку');
            return bestMoves[0];
        }
        
        // 3. Взятия с оценкой
        bestMoves = moves.filter(move => 
            move.san.includes('x') || move.flags.includes('c')
        );
        
        if (bestMoves.length > 0) {
            bestMoves.sort((a, b) => this.getExpertCaptureValue(b) - this.getExpertCaptureValue(a));
            console.log('🧠 Эксперт оценил взятия');
            return bestMoves[0];
        }
        
        // 4. Позиционные улучшения
        bestMoves = moves.filter(move => 
            this.isExpertPositionalMove(move)
        );
        
        if (bestMoves.length > 0) {
            bestMoves.sort((a, b) => this.getPositionalScore(b) - this.getPositionalScore(a));
            console.log('🧠 Эксперт выбрал позиционный ход');
            return bestMoves[0];
        }
        
        // 5. Избегаем плохих ходов
        const safeMoves = moves.filter(move => !this.isExpertBadMove(move));
        if (safeMoves.length > 0) {
            console.log('🧠 Эксперт избегает плохих ходов');
            return safeMoves[Math.floor(Math.random() * Math.min(safeMoves.length, 4))];
        }
        
        // 6. Любой ход
        console.log('🧠 Эксперт делает случайный ход');
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ЭКСПЕРТА ===
    isStrongAttack(move) {
        const piece = this.chess.get(move.from);
        return piece && (piece.type === 'q' || piece.type === 'r');
    }

    getExpertCaptureValue(move) {
        const pieceValues = {
            'p': 1, 'n': 3.2, 'b': 3.3, 'r': 5, 'q': 9, 'k': 0
        };
        
        const capturedPiece = this.chess.get(move.to);
        let value = 0;
        
        if (capturedPiece) {
            value = pieceValues[capturedPiece.type] || 0;
            
            // Бонус за взятие в центре
            const centerSquares = ['d4', 'e4', 'd5', 'e5'];
            if (centerSquares.includes(move.to)) {
                value += 0.5;
            }
        }
        
        return value;
    }

    isExpertPositionalMove(move) {
        const centerSquares = ['d4', 'e4', 'd5', 'e5', 'c3', 'f3', 'c6', 'f6'];
        const developmentSquares = ['c3', 'f3', 'c6', 'f6', 'd2', 'e2', 'd7', 'e7'];
        
        if (centerSquares.includes(move.to)) return true;
        if (developmentSquares.includes(move.to)) return true;
        
        // Рокировка
        if (move.san === 'O-O' || move.san === 'O-O-O') return true;
        
        return false;
    }

    getPositionalScore(move) {
        let score = 0;
        const centerSquares = ['d4', 'e4', 'd5', 'e5'];
        
        if (centerSquares.includes(move.to)) {
            score += 2;
        }
        
        if (move.san === 'O-O' || move.san === 'O-O-O') {
            score += 3;
        }
        
        return score;
    }

    isExpertBadMove(move) {
        if (move.san.includes('??')) return true;
        if (move.san.includes('?') && Math.random() < 0.9) return true;
        
        const badSquares = ['a3', 'h3', 'a6', 'h6'];
        const piece = this.chess.get(move.from);
        
        if (piece && piece.type === 'p' && badSquares.includes(move.to)) {
            return true;
        }
        
        return false;
    }

    // === БАЗОВЫЕ МЕТОДЫ ===
    isBadMove(move) {
        const badSquares = ['a3', 'h3', 'a6', 'h6'];
        const piece = this.chess.get(move.from);
        
        if (piece && piece.type === 'p') {
            if (badSquares.includes(move.to)) return true;
        }
        
        return move.san.includes('??') ||
               (move.san.includes('?') && Math.random() < 0.7);
    }

    isGoodPositionalMove(move) {
        const centerSquares = ['d4', 'e4', 'd5', 'e5', 'c3', 'f3', 'c6', 'f6'];
        const developmentSquares = ['c3', 'f3', 'c6', 'f6', 'd2', 'e2', 'd7', 'e7'];
        
        if (centerSquares.includes(move.to)) return true;
        if (developmentSquares.includes(move.to)) return true;
        
        return false;
    }

    getCaptureValue(move) {
        const pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };
        
        const capturedPiece = this.chess.get(move.to);
        if (capturedPiece) {
            return pieceValues[capturedPiece.type] || 0;
        }
        return 0;
    }

    // === УПРАВЛЕНИЕ ИГРОЙ ===
    handleModeChange() {
        console.log(`🔄 Смена режима на: ${this.gameMode}`);
        
        this.updateModeControls();
        this.clearSelection();
        this.updateGame();
        
        if (this.gameMode === 'vsBot' && this.currentPlayer === 'b' && !this.chess.game_over() && !this.isBotThinking) {
            console.log('🤖 Переключились в режим против бота, ход черных - запускаем бота');
            setTimeout(() => {
                this.makeBotMove();
            }, 500);
        }
        
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = this.gameMode === 'vsBot' ? 
                'Режим: Против бота' : 'Режим: Два игрока';
            statusElement.style.color = '#2196F3';
            
            setTimeout(() => {
                this.updateStatus();
            }, 2000);
        }
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
            'hard': '🔥 Сложный',
            'expert': '🧠 Эксперт'
        };
        
        if (this.chess.game_over()) {
            if (this.chess.in_checkmate()) {
                const winner = this.currentPlayer === 'w' ? 'черные' : 'белые';
                statusElement.textContent = `🎉 Мат! ${winner} выиграли!`;
            } else {
                statusElement.textContent = '🤝 Ничья!';
            }
        } else {
            if (this.gameMode === 'vsBot') {
                if (this.isBotThinking) {
                    statusElement.textContent = `Ход бота (${difficultyNames[this.difficulty]})...`;
                    statusElement.style.color = '#FF5722';
                } else if (this.currentPlayer === 'w') {
                    statusElement.textContent = `Ваш ход (${difficultyNames[this.difficulty]})`;
                    statusElement.style.color = '#4CAF50';
                } else {
                    statusElement.textContent = `Ход бота (${difficultyNames[this.difficulty]})...`;
                    statusElement.style.color = '#FF5722';
                }
            } else {
                const currentColor = this.currentPlayer === 'w' ? 'белые' : 'черные';
                
                if (this.currentPlayer === 'w') {
                    statusElement.innerHTML = `⚪ Ходят белые`;
                    statusElement.style.color = '#FFFFFF';
                    statusElement.style.background = '#333333';
                } else {
                    statusElement.innerHTML = `⚫ Ходят черные`;
                    statusElement.style.color = '#000000';
                    statusElement.style.background = '#DDDDDD';
                }
                
                statusElement.style.padding = '5px 10px';
                statusElement.style.borderRadius = '10px';
                statusElement.style.display = 'inline-block';
                statusElement.style.fontWeight = 'bold';
                statusElement.style.textShadow = 'none';
            }
        }
        
        turnElement.textContent = `Ход: ${this.currentPlayer === 'w' ? 'белые' : 'черные'}`;
        
        if (this.gameMode === 'vsBot') {
            statusElement.style.background = '';
            statusElement.style.padding = '';
            statusElement.style.borderRadius = '';
            statusElement.style.display = '';
            statusElement.style.fontWeight = '';
            statusElement.style.textShadow = '';
        }
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

    // === СОХРАНЕНИЕ И ЗАГРУЗКА ===
    saveGame() {
        try {
            const gameState = {
                fen: this.chess.fen(),
                movesHistory: this.movesHistory,
                difficulty: this.difficulty,
                gameMode: this.gameMode,
                currentPlayer: this.currentPlayer,
                timestamp: new Date().toISOString(),
                gameVersion: "2.2.1"
            };
            
            localStorage.setItem('chessGameState', JSON.stringify(gameState));
        } catch (error) {
            console.error('Ошибка при сохранении игры:', error);
        }
    }

    loadGame() {
        try {
            const saved = localStorage.getItem('chessGameState');
            if (saved) {
                const gameState = JSON.parse(saved);
                
                if (!gameState.gameVersion || gameState.gameVersion !== "2.2.1") {
                    console.log('💾 Устаревший формат сохранения, начинаем новую игру');
                    localStorage.removeItem('chessGameState');
                    return;
                }
                
                const savedTime = new Date(gameState.timestamp);
                const currentTime = new Date();
                const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    this.chess.load(gameState.fen);
                    this.movesHistory = gameState.movesHistory || [];
                    this.difficulty = gameState.difficulty || 'medium';
                    this.gameMode = gameState.gameMode || 'vsBot';
                    this.currentPlayer = gameState.currentPlayer || 'w';
                    
                    console.log(`💾 Игра загружена. Режим: ${this.gameMode}, Ход: ${this.currentPlayer === 'w' ? 'белые' : 'черные'}, Уровень: ${this.difficulty}`);
                    
                    const modeSelect = document.getElementById('gameMode');
                    const difficultySelect = document.getElementById('difficulty');
                    
                    if (modeSelect) modeSelect.value = this.gameMode;
                    if (difficultySelect) difficultySelect.value = this.difficulty;
                    
                    this.updateThinkingTime();
                    this.updateModeControls();
                    this.showLoadNotification();
                    
                    this.checkAndStartBot();
                } else {
                    console.log('💾 Сохранение устарело, начинаем новую игру');
                    localStorage.removeItem('chessGameState');
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке игры:', error);
            localStorage.removeItem('chessGameState');
        }
    }

    checkAndStartBot() {
        if (this.gameMode === 'vsBot' && this.currentPlayer === 'b' && !this.chess.game_over() && !this.isBotThinking) {
            console.log('🤖 При загрузке игры: ход черных - запускаем бота');
            setTimeout(() => {
                this.makeBotMove();
            }, 1000);
        }
    }

    showLoadNotification() {
        setTimeout(() => {
            const statusElement = document.getElementById('status');
            if (statusElement) {
                const originalText = statusElement.textContent;
                statusElement.textContent = '💾 Игра загружена!';
                statusElement.style.color = '#4CAF50';
                
                setTimeout(() => {
                    statusElement.textContent = originalText;
                    statusElement.style.color = '';
                }, 2000);
            }
        }, 500);
    }

    // === КНОПКИ УПРАВЛЕНИЯ ===
    newGame() {
        if (confirm('Начать новую игру? Текущий прогресс будет потерян.')) {
            this.chess.reset();
            this.selectedSquare = null;
            this.legalMoves = [];
            this.currentPlayer = 'w';
            this.movesHistory = [];
            this.clearHighlights();
            this.updateGame();
            this.updateMovesList();
            this.saveGame();
            
            const statusElement = document.getElementById('status');
            if (statusElement) {
                statusElement.textContent = '🎮 Новая игра началась!';
                setTimeout(() => this.updateStatus(), 2000);
            }
        }
    }

    flipBoard() {
        alert('Переворот доски в разработке');
    }

    surrender() {
        if (confirm('Сдаться?')) {
            this.newGame();
            document.getElementById('status').textContent = '🏳️ Вы сдались!';
            this.saveGame();
        }
    }
}

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting chess game...');
    new ChessGame();
});
