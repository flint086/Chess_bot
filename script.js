// == ШАХМАТЫ В TELEGRAM ==
// Версия: 2.3.1
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
// 2.3.0 - Улучшен экспертный уровень: мини-макс алгоритм на 3 хода вперед
// 2.3.1 - Исправлено странное поведение экспертного уровня, улучшена оценка позиций

// Telegram Web App Integration
class TelegramIntegration {
    constructor() {
        this.isTelegram = false;
        this.version = "2.3.1";
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
            "2.2.1": "Исправлено отображение доски и выбор сложности",
            "2.3.0": "Улучшен экспертный уровень: мини-макс алгоритм на 3 хода вперед",
            "2.3.1": "Исправлено странное поведение экспертного уровня, улучшена оценка позиций"
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
                alert(`🎉 Новая версия шахмат v${this.version}!\n\nЭкспертный уровень теперь работает корректно! 🧠⚡`);
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
        this.lastBotMove = null;
        this.moveOscillationCounter = {};
        
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
                <option value="expert">🧠 Эксперт (мини-макс)</option>
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
                this.botThinkingTime = 3500; // 3.5 секунды для мини-макса
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
            
            let selectedMove;
            
            if (this.difficulty === 'expert') {
                selectedMove = this.getExpertMinimaxMove(moves);
            } else {
                selectedMove = this.getBestMove(moves);
            }
            
            // Проверка на осмысленность хода
            if (selectedMove && this.isMeaninglessMove(selectedMove, moves)) {
                console.log('⚠️ Предотвращен бессмысленный ход, выбираю альтернативу');
                selectedMove = this.getAlternativeMove(moves, selectedMove);
            }
            
            if (selectedMove) {
                const moveResult = this.chess.move(selectedMove);
                if (moveResult) {
                    this.movesHistory.push(moveResult.san);
                    this.lastBotMove = {
                        from: selectedMove.from,
                        to: selectedMove.to,
                        san: moveResult.san
                    };
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
            default:
                return this.createMoveObject(this.getMediumMove(moves));
        }
    }

    // === УРОВНИ СЛОЖНОСТИ (старые) ===
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

    // === НОВЫЙ ЭКСПЕРТНЫЙ УРОВЕНЬ С МИНИ-МАКСОМ ===
    getExpertMinimaxMove(moves) {
        console.log('🧠 Эксперт использует мини-макс алгоритм (глубина 3)...');
        
        // Если мало ходов - простой выбор
        if (moves.length <= 3 || this.chess.game_over()) {
            const hardMove = this.getHardMove(moves);
            return this.createMoveObject(hardMove);
        }
        
        let bestMove = null;
        let bestScore = -Infinity;
        let evaluatedMoves = 0;
        
        // Сортируем ходы для лучшего поиска (лучшие ходы сначала)
        const sortedMoves = this.sortMovesForMinimax(moves);
        
        // Оцениваем каждый возможный ход
        for (const move of sortedMoves) {
            const moveObj = this.createMoveObject(move);
            
            // Делаем ход на временной доске
            const tempChess = new Chess(this.chess.fen());
            const result = tempChess.move(moveObj);
            
            if (result) {
                // Оцениваем позицию после этого хода
                // Глубина 3: наш ход -> ответ противника -> наш ответ
                const score = this.minimax(tempChess, 2, false, -Infinity, Infinity);
                
                console.log(`🧠 Ход ${move.san}: оценка ${score.toFixed(2)}`);
                
                if (score > bestScore || (score === bestScore && Math.random() > 0.5)) {
                    bestScore = score;
                    bestMove = move;
                }
                
                evaluatedMoves++;
                
                // Ограничиваем количество оцениваемых ходов, но более разумно
                if (evaluatedMoves >= 20 && moves.length > 25) {
                    console.log(`🧠 Оценил ${evaluatedMoves} из ${moves.length} ходов`);
                    break;
                }
            }
        }
        
        if (bestMove) {
            console.log(`🧠 Выбран ход ${bestMove.san} с оценкой ${bestScore.toFixed(2)}`);
            return this.createMoveObject(bestMove);
        }
        
        // Фолбэк
        console.log('🧠 Мини-макс не дал результата, использую старый алгоритм');
        return this.createMoveObject(this.getHardMove(moves));
    }

    // Улучшенная сортировка ходов для минимакса
    sortMovesForMinimax(moves) {
        return moves.sort((a, b) => {
            // Приоритет: мат, шах, взятия, хорошие ходы
            const scoreA = this.getMovePriority(a);
            const scoreB = this.getMovePriority(b);
            return scoreB - scoreA;
        });
    }

    getMovePriority(move) {
        let priority = 0;
        
        // Мат - максимальный приоритет
        if (move.san.includes('#')) return 1000;
        
        // Шах
        if (move.san.includes('+')) priority += 100;
        
        // Взятие
        if (move.san.includes('x')) {
            const captured = this.chess.get(move.to);
            if (captured) {
                priority += this.getPieceValue(captured.type) * 10;
            }
        }
        
        // Рокировка
        if (move.san === 'O-O' || move.san === 'O-O-O') priority += 50;
        
        // Развитие фигур в начале
        if (this.chess.moveNumber() < 10) {
            const piece = this.chess.get(move.from);
            if (piece && (piece.type === 'n' || piece.type === 'b')) {
                priority += 20;
            }
        }
        
        // Предотвращение осцилляций
        if (this.lastBotMove && move.from === this.lastBotMove.to && move.to === this.lastBotMove.from) {
            priority -= 200; // Сильный штраф за ход туда-обратно
        }
        
        return priority;
    }

    // Мини-макс алгоритм с альфа-бета отсечением
    minimax(board, depth, isMaximizing, alpha, beta) {
        // Базовые случаи
        if (depth === 0 || board.game_over()) {
            return this.evaluateBoard(board);
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            const moves = board.moves({ verbose: true });
            
            // Сортируем ходы для лучшей работы альфа-бета отсечения
            const sortedMoves = this.sortMovesForMinimaxSearch(board, moves, true);
            
            for (const move of sortedMoves) {
                const tempBoard = new Chess(board.fen());
                const moveObj = { from: move.from, to: move.to };
                
                // Обработка превращения пешки
                const piece = tempBoard.get(move.from);
                if (piece && piece.type === 'p') {
                    const targetRank = move.to[1];
                    if ((piece.color === 'b' && targetRank === '1') || 
                        (piece.color === 'w' && targetRank === '8')) {
                        moveObj.promotion = 'q';
                    }
                }
                
                tempBoard.move(moveObj);
                
                const evalScore = this.minimax(tempBoard, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                
                if (beta <= alpha) {
                    break; // Альфа-бета отсечение
                }
                
                // Ограничиваем глубину поиска для скорости
                if (depth >= 2 && moves.length > 30) {
                    break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            const moves = board.moves({ verbose: true });
            
            const sortedMoves = this.sortMovesForMinimaxSearch(board, moves, false);
            
            for (const move of sortedMoves) {
                const tempBoard = new Chess(board.fen());
                const moveObj = { from: move.from, to: move.to };
                
                // Обработка превращения пешки
                const piece = tempBoard.get(move.from);
                if (piece && piece.type === 'p') {
                    const targetRank = move.to[1];
                    if ((piece.color === 'b' && targetRank === '1') || 
                        (piece.color === 'w' && targetRank === '8')) {
                        moveObj.promotion = 'q';
                    }
                }
                
                tempBoard.move(moveObj);
                
                const evalScore = this.minimax(tempBoard, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                
                if (beta <= alpha) {
                    break; // Альфа-бета отсечение
                }
                
                if (depth >= 2 && moves.length > 30) {
                    break;
                }
            }
            return minEval;
        }
    }

    // Сортировка ходов для поиска в минимаксе
    sortMovesForMinimaxSearch(board, moves, isMaximizing) {
        return moves.sort((a, b) => {
            const scoreA = this.quickEvaluateMoveForSearch(board, a, isMaximizing);
            const scoreB = this.quickEvaluateMoveForSearch(board, b, isMaximizing);
            return isMaximizing ? scoreB - scoreA : scoreA - scoreB;
        });
    }

    // Быстрая оценка хода для сортировки в поиске
    quickEvaluateMoveForSearch(board, move, isMaximizing) {
        let score = 0;
        
        // Взятия
        const captured = board.get(move.to);
        if (captured) {
            score += this.getPieceValue(captured.type) * 10;
        }
        
        // Шах
        if (move.san.includes('+')) {
            score += 5;
        }
        
        // Мат
        if (move.san.includes('#')) {
            score += 1000;
        }
        
        // Предотвращение возврата на ту же клетку
        const moveKey = `${move.from}-${move.to}`;
        if (this.moveOscillationCounter[moveKey] > 1) {
            score -= 50;
        }
        
        return isMaximizing ? score : -score;
    }

    // Оценка позиции на доске - ИСПРАВЛЕННАЯ
    evaluateBoard(board) {
        if (board.game_over()) {
            if (board.in_checkmate()) {
                // Мат для стороны, которая сейчас ходит - плохо
                // Бот играет за черных, поэтому мат черных - очень плохо
                return board.turn() === 'b' ? -10000 : 10000;
            }
            // Ничья
            return 0;
        }
        
        let score = 0;
        
        // Материальный счет (с точки зрения белых)
        score += this.evaluateMaterial(board);
        
        // Позиционный счет
        score += this.evaluatePosition(board);
        
        // Активность фигур
        score += this.evaluateMobility(board);
        
        // Безопасность короля
        score += this.evaluateKingSafety(board);
        
        // Пешечная структура
        score += this.evaluatePawnStructure(board);
        
        // Контроль центра
        score += this.evaluateCenterControl(board);
        
        // Развитие фигур в начале игры
        score += this.evaluateDevelopment(board);
        
        // Шах - небольшой бонус
        if (board.in_check()) {
            // Шах стороне, которая сейчас ходит - плохо для нее
            score += board.turn() === 'w' ? -15 : 15;
        }
        
        return score;
    }

    // Оценка материала
    evaluateMaterial(board) {
        let score = 0;
        const pieceValues = {
            'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 0
        };
        
        const boardState = board.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = boardState[i][j];
                if (piece) {
                    const value = pieceValues[piece.type] || 0;
                    score += piece.color === 'w' ? value : -value;
                }
            }
        }
        
        return score;
    }

    // Оценка позиции (где стоят фигуры)
    evaluatePosition(board) {
        let score = 0;
        const boardState = board.board();
        
        // Таблицы позиционных оценок (с точки зрения белых)
        const pawnTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];
        
        const knightTable = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];
        
        const bishopTable = [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ];
        
        const kingTableMid = [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [20, 20,  0,  0,  0,  0, 20, 20],
            [20, 30, 10,  0,  0, 10, 30, 20]
        ];
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = boardState[i][j];
                if (piece) {
                    let tableValue = 0;
                    const row = piece.color === 'w' ? 7 - i : i;
                    const col = piece.color === 'w' ? j : 7 - j;
                    
                    switch(piece.type) {
                        case 'p':
                            tableValue = pawnTable[row][col];
                            break;
                        case 'n':
                            tableValue = knightTable[row][col];
                            break;
                        case 'b':
                            tableValue = bishopTable[row][col];
                            break;
                        case 'r':
                            // Ладьи на открытых вертикалях
                            tableValue = (row >= 2 && row <= 5) ? 10 : 0;
                            break;
                        case 'q':
                            // Ферзи в центре
                            tableValue = (row >= 2 && row <= 5 && col >= 2 && col <= 5) ? 10 : 0;
                            break;
                        case 'k':
                            if (board.moveNumber() > 30) { // Эндшпиль
                                // Король идет в центр в эндшпиле
                                tableValue = -Math.abs(3.5 - row) * 10 - Math.abs(3.5 - col) * 10;
                            } else {
                                tableValue = kingTableMid[row][col];
                            }
                            break;
                    }
                    
                    score += piece.color === 'w' ? tableValue : -tableValue;
                }
            }
        }
        
        return score;
    }

    // Оценка мобильности (сколько ходов доступно)
    evaluateMobility(board) {
        const moves = board.moves().length;
        // Ходы за белых - плюс, ходы за черных - минус
        // Но нужно учитывать чей сейчас ход
        const score = moves * 0.1;
        return board.turn() === 'w' ? score : -score;
    }

    // Оценка безопасности короля
    evaluateKingSafety(board) {
        let score = 0;
        const boardState = board.board();
        
        // Находим королей
        let whiteKingSquare = null;
        let blackKingSquare = null;
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = boardState[i][j];
                if (piece && piece.type === 'k') {
                    if (piece.color === 'w') {
                        whiteKingSquare = { row: i, col: j };
                    } else {
                        blackKingSquare = { row: i, col: j };
                    }
                }
            }
        }
        
        // Оцениваем безопасность по количеству пешек вокруг короля
        if (whiteKingSquare) {
            const pawnShield = this.countPawnShield(board, whiteKingSquare, 'w');
            score += pawnShield * 15;
        }
        
        if (blackKingSquare) {
            const pawnShield = this.countPawnShield(board, blackKingSquare, 'b');
            score -= pawnShield * 15;
        }
        
        return score;
    }

    countPawnShield(board, kingSquare, color) {
        let shield = 0;
        const row = kingSquare.row;
        const col = kingSquare.col;
        
        // Пешки перед королем и рядом
        for (let rOffset = -1; rOffset <= 1; rOffset++) {
            for (let cOffset = -1; cOffset <= 1; cOffset++) {
                if (rOffset === 0 && cOffset === 0) continue;
                
                const checkRow = row + (color === 'w' ? 1 : -1) + rOffset;
                const checkCol = col + cOffset;
                
                if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
                    const piece = board.get(this.getSquareName2(checkRow, checkCol));
                    if (piece && piece.type === 'p' && piece.color === color) {
                        shield++;
                    }
                }
            }
        }
        
        return shield;
    }

    getSquareName2(row, col) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return files[col] + ranks[row];
    }

    // Новая функция: контроль центра
    evaluateCenterControl(board) {
        let score = 0;
        const centerSquares = ['d4', 'e4', 'd5', 'e5', 'c3', 'f3', 'c6', 'f6'];
        
        for (const square of centerSquares) {
            const piece = board.get(square);
            if (piece) {
                score += piece.color === 'w' ? 5 : -5;
            }
            
            // Также учитываем атаку на центр
            const attacks = board.moves({ square: square, verbose: true });
            for (const attack of attacks) {
                const attackingPiece = board.get(attack.from);
                if (attackingPiece) {
                    score += attackingPiece.color === 'w' ? 1 : -1;
                }
            }
        }
        
        return score;
    }

    // Новая функция: оценка развития
    evaluateDevelopment(board) {
        let score = 0;
        const boardState = board.board();
        
        // Если еще начало игры (первые 15 ходов)
        if (board.moveNumber() < 15) {
            // Штраф за неразвитые фигуры
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    const piece = boardState[i][j];
                    if (piece && piece.type !== 'p' && piece.type !== 'k') {
                        // Фигуры на начальной позиции
                        if (piece.color === 'w' && i === 7 && (j === 0 || j === 7 || j === 1 || j === 6 || j === 2 || j === 5 || j === 3 || j === 4)) {
                            score -= 15; // Белые не развили фигуру
                        }
                        if (piece.color === 'b' && i === 0 && (j === 0 || j === 7 || j === 1 || j === 6 || j === 2 || j === 5 || j === 3 || j === 4)) {
                            score += 15; // Черные не развили фигуру
                        }
                    }
                }
            }
        }
        
        return score;
    }

    // Оценка пешечной структуры
    evaluatePawnStructure(board) {
        let score = 0;
        const boardState = board.board();
        
        // Изолированные пешки
        const whiteIsolated = this.countIsolatedPawns(boardState, 'w');
        const blackIsolated = this.countIsolatedPawns(boardState, 'b');
        
        // Сдвоенные пешки
        const whiteDoubled = this.countDoubledPawns(boardState, 'w');
        const blackDoubled = this.countDoubledPawns(boardState, 'b');
        
        // Проходные пешки
        const whitePassed = this.countPassedPawns(board, 'w');
        const blackPassed = this.countPassedPawns(board, 'b');
        
        score -= whiteIsolated * 20;
        score += blackIsolated * 20;
        score -= whiteDoubled * 15;
        score += blackDoubled * 15;
        score += whitePassed * 30;
        score -= blackPassed * 30;
        
        return score;
    }

    countIsolatedPawns(boardState, color) {
        let isolated = 0;
        const pawnFiles = new Set();
        
        // Собираем все файлы с пешками
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = boardState[i][j];
                if (piece && piece.type === 'p' && piece.color === color) {
                    pawnFiles.add(j);
                }
            }
        }
        
        // Проверяем изолированные пешки
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = boardState[i][j];
                if (piece && piece.type === 'p' && piece.color === color) {
                    const hasLeftPawn = pawnFiles.has(j - 1);
                    const hasRightPawn = pawnFiles.has(j + 1);
                    
                    if (!hasLeftPawn && !hasRightPawn) {
                        isolated++;
                    }
                }
            }
        }
        
        return isolated;
    }

    countDoubledPawns(boardState, color) {
        let doubled = 0;
        const pawnsPerFile = new Array(8).fill(0);
        
        // Считаем пешки по файлам
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = boardState[i][j];
                if (piece && piece.type === 'p' && piece.color === color) {
                    pawnsPerFile[j]++;
                }
            }
        }
        
        // Сдвоенные пешки - больше одной на файле
        for (let count of pawnsPerFile) {
            if (count > 1) {
                doubled += count - 1;
            }
        }
        
        return doubled;
    }

    countPassedPawns(board, color) {
        let passed = 0;
        const boardState = board.board();
        const direction = color === 'w' ? -1 : 1;
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = boardState[i][j];
                if (piece && piece.type === 'p' && piece.color === color) {
                    let isPassed = true;
                    
                    // Проверяем нет ли вражеских пешек перед этой пешкой
                    for (let checkRow = i + direction; checkRow >= 0 && checkRow < 8; checkRow += direction) {
                        for (let checkCol = Math.max(0, j - 1); checkCol <= Math.min(7, j + 1); checkCol++) {
                            const checkPiece = boardState[checkRow][checkCol];
                            if (checkPiece && checkPiece.type === 'p' && checkPiece.color !== color) {
                                isPassed = false;
                                break;
                            }
                        }
                        if (!isPassed) break;
                    }
                    
                    if (isPassed) {
                        passed++;
                        // Бонус за продвинутую проходную пешку
                        const advancement = color === 'w' ? 7 - i : i;
                        passed += advancement * 0.5;
                    }
                }
            }
        }
        
        return passed;
    }

    getPieceValue(pieceType) {
        const values = {
            'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 0
        };
        return values[pieceType] || 0;
    }

    // === ПРЕДОТВРАЩЕНИЕ БЕССМЫСЛЕННЫХ ХОДОВ ===
    isMeaninglessMove(move, allMoves) {
        if (!move) return true;
        
        // 1. Проверка на ход туда-обратно
        if (this.lastBotMove) {
            if (move.from === this.lastBotMove.to && move.to === this.lastBotMove.from) {
                console.log('⚠️ Обнаружен ход туда-обратно');
                return true;
            }
        }
        
        // 2. Проверка на осцилляцию (A->B->A->B)
        const recentMoves = this.movesHistory.slice(-6);
        if (recentMoves.length >= 4) {
            const movePattern = this.detectMoveOscillation(recentMoves, move);
            if (movePattern) {
                console.log('⚠️ Обнаружена осцилляция ходов');
                return true;
            }
        }
        
        // 3. Проверка на ход той же фигурой слишком часто
        const moveKey = `${move.from}-${move.to}`;
        if (!this.moveOscillationCounter[moveKey]) {
            this.moveOscillationCounter[moveKey] = 0;
        }
        this.moveOscillationCounter[moveKey]++;
        
        if (this.moveOscillationCounter[moveKey] > 2) {
            console.log('⚠️ Фигура ходит слишком часто на одни и те же клетки');
            return true;
        }
        
        // 4. Проверка на очень слабый ход (отдача материала без компенсации)
        const piece = this.chess.get(move.from);
        const captured = this.chess.get(move.to);
        
        if (piece && captured) {
            const pieceValue = this.getPieceValue(piece.type);
            const capturedValue = this.getPieceValue(captured.type);
            
            // Если отдаем более ценную фигуру за менее ценную
            if (pieceValue > capturedValue * 1.5) {
                console.log('⚠️ Плохой размен: отдаем более ценную фигуру');
                return true;
            }
        }
        
        return false;
    }

    detectMoveOscillation(recentMoves, currentMove) {
        // Преобразуем ходы в упрощенный формат "from-to"
        const simplifiedMoves = recentMoves.map(san => {
            // Это упрощение - в реальности нужно парсить SAN нотацию
            // Для демо просто возвращаем последние 2 символа
            return san;
        });
        
        // Проверяем паттерны типа A B A B
        if (simplifiedMoves.length >= 4) {
            const lastFour = simplifiedMoves.slice(-4);
            // Простая проверка на повторение
            if (lastFour[0] === lastFour[2] && lastFour[1] === lastFour[3]) {
                return true;
            }
        }
        
        return false;
    }

    getAlternativeMove(moves, badMove) {
        // Ищем альтернативный ход, отличный от плохого
        const goodMoves = moves.filter(move => {
            const moveObj = this.createMoveObject(move);
            return !this.isMeaninglessMove(moveObj, moves) && 
                   (move.from !== badMove.from || move.to !== badMove.to);
        });
        
        if (goodMoves.length > 0) {
            // Выбираем лучший ход из оставшихся
            if (this.difficulty === 'expert') {
                return this.createMoveObject(this.getHardMove(goodMoves));
            } else {
                return this.createMoveObject(goodMoves[Math.floor(Math.random() * goodMoves.length)]);
            }
        }
        
        // Если нет хороших ходов, выбираем случайный, но не тот же самый
        const otherMoves = moves.filter(move => 
            move.from !== badMove.from || move.to !== badMove.to
        );
        
        if (otherMoves.length > 0) {
            return this.createMoveObject(otherMoves[Math.floor(Math.random() * otherMoves.length)]);
        }
        
        // Если все ходы плохие, возвращаем исходный
        return badMove;
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
            'expert': '🧠 Эксперт (мини-макс)'
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
                gameVersion: "2.3.1"
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
                
                if (!gameState.gameVersion || gameState.gameVersion !== "2.3.1") {
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
            this.lastBotMove = null;
            this.moveOscillationCounter = {};
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
