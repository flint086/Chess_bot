// == ШАХМАТЫ В TELEGRAM ==
// Версия: 2.2.0
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

// Telegram Web App Integration
class TelegramIntegration {
    constructor() {
        this.isTelegram = false;
        this.version = "2.2.0";
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
            "2.2.0": "Добавлен новый уровень сложности 'Эксперт'"
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
                alert(`🎉 Новая версия шахмат v${this.version}!\n\nДобавлен новый уровень сложности "Эксперт"! 🧠`);
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
                <option value="twoPlayers">👥 Два игрока (на одном устройстве)</option>
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

    handleModeChange() {
        console.log(`🔄 Смена режима с ${this.gameMode === 'vsBot' ? 'двух игроков' : 'против бота'} на ${this.gameMode === 'vsBot' ? 'против бота' : 'двух игроков'}`);
        
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

    updateModeControls() {
        const difficultySelector = document.querySelector('.difficulty-selector');
        
        if (this.gameMode === 'vsBot') {
            if (difficultySelector) difficultySelector.style.display = 'block';
        } else {
            if (difficultySelector) difficultySelector.style.display = 'none';
        }
    }

    // СОЗДАЕМ ВЫБОР СЛОЖНОСТИ С НОВЫМ УРОВНЕМ
    createDifficultySelector() {
        const controls = document.querySelector('.controls');
        if (!controls) return;

        const difficultyDiv = document.createElement('div');
        difficultyDiv.className = 'difficulty-selector';
        difficultyDiv.style.margin = '10px 0';
        difficultyDiv.style.textAlign = 'center';
        
        difficultyDiv.innerHTML = `
            <label style="margin-right: 10px;">Уровень бота:</label>
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
            case 'expert':
                this.botThinkingTime = 1800; // 1.8 секунды для эксперта
                break;
        }
        this.saveGame();
    }

    saveGame() {
        try {
            const gameState = {
                fen: this.chess.fen(),
                movesHistory: this.movesHistory,
                difficulty: this.difficulty,
                gameMode: this.gameMode,
                currentPlayer: this.currentPlayer,
                timestamp: new Date().toISOString(),
                gameVersion: "2.2.0"
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
                
                if (!gameState.gameVersion || gameState.gameVersion !== "2.2.0") {
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

    // Остальные методы остаются без изменений до getBestMove...

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

    // НОВЫЙ МЕТОД ДЛЯ ЭКСПЕРТА
    getExpertMove(moves) {
        console.log('🧠 Эксперт анализирует позицию...');
        
        // 1. Приоритет - мат в 1 ход
        let bestMoves = moves.filter(move => move.san.includes('#'));
        if (bestMoves.length > 0) {
            console.log('🧠 Эксперт нашел матовый ход!');
            return this.selectBestExpertMove(bestMoves);
        }
        
        // 2. Приоритет - сильные атаки (шах с угрозой)
        bestMoves = moves.filter(move => 
            move.san.includes('+') && this.isStrongAttack(move)
        );
        if (bestMoves.length > 0) {
            console.log('🧠 Эксперт нашел сильную атаку');
            return this.selectBestExpertMove(bestMoves);
        }
        
        // 3. Приоритет - взятия фигур с оценкой позиции
        bestMoves = moves.filter(move => 
            move.san.includes('x') || move.flags.includes('c')
        );
        
        if (bestMoves.length > 0) {
            // Сортировка по ценности взятия и позиционному преимуществу
            bestMoves.sort((a, b) => {
                const valueDiff = this.getExpertCaptureValue(b) - this.getExpertCaptureValue(a);
                if (Math.abs(valueDiff) > 2) return valueDiff;
                
                // Если разница небольшая, учитываем позиционное преимущество
                const posA = this.getPositionalAdvantage(a);
                const posB = this.getPositionalAdvantage(b);
                return (posB - posA) || valueDiff;
            });
            
            console.log('🧠 Эксперт оценил взятия');
            return this.selectBestExpertMove(bestMoves.slice(0, 3)); // Лучшие 3 взятия
        }
        
        // 4. Позиционные улучшения
        bestMoves = moves.filter(move => 
            this.isExpertPositionalMove(move)
        );
        
        if (bestMoves.length > 0) {
            // Сортировка по силе позиционного хода
            bestMoves.sort((a, b) => this.getPositionalScore(b) - this.getPositionalScore(a));
            console.log('🧠 Эксперт выбрал позиционный ход');
            return this.selectBestExpertMove(bestMoves.slice(0, 2));
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

    selectBestExpertMove(moves) {
        if (moves.length === 0) return null;
        if (moves.length === 1) return moves[0];
        
        // Выбираем лучший ход из предложенных с учетом тактики
        return moves[0]; // Самый лучший по сортировке
    }

    isStrongAttack(move) {
        // Сильная атака - шах, который создает дополнительные угрозы
        const piece = this.chess.get(move.from);
        
        if (!piece) return false;
        
        // Шах ферзем, ладьей, слоном по длинной диагонали - сильная атака
        if (piece.type === 'q' || piece.type === 'r') return true;
        
        // Шах слоном по центральной диагонали
        if (piece.type === 'b') {
            const centerDiagonals = ['a1-h8', 'h1-a8', 'd1-a4', 'e1-h4', 'a5-d8', 'h5-e8'];
            const diagonal = `${move.from[0]}${move.from[1]}-${move.to[0]}${move.to[1]}`;
            return centerDiagonals.some(d => diagonal.includes(d));
        }
        
        return false;
    }

    getExpertCaptureValue(move) {
        // Улучшенная оценка взятия с учетом позиции
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
            
            // Бонус за взятие защищенной фигуры
            if (this.isPieceDefended(move.to)) {
                value += 0.3;
            }
            
            // Штраф за взятие своей фигурой, которая будет потеряна
            const attackingPiece = this.chess.get(move.from);
            if (attackingPiece && this.isPieceHanging(move.from)) {
                value -= pieceValues[attackingPiece.type] || 0;
            }
        }
        
        return value;
    }

    isPieceDefended(square) {
        // Проверяем, защищена ли фигура
        const piece = this.chess.get(square);
        if (!piece) return false;
        
        // Получаем все ходы для защиты этой фигуры
        const moves = this.chess.moves({ verbose: true });
        const defendingMoves = moves.filter(m => 
            m.to === square && this.chess.get(m.from)?.color === piece.color
        );
        
        return defendingMoves.length > 0;
    }

    isPieceHanging(square) {
        // Проверяем, висит ли фигура (незащищена)
        const piece = this.chess.get(square);
        if (!piece) return false;
        
        // Получаем все ходы противника
        const tempChess = new Chess(this.chess.fen());
        tempChess.turn = tempChess.turn() === 'w' ? 'b' : 'w'; // Меняем ход
        
        const opponentMoves = tempChess.moves({ verbose: true });
        const attackingMoves = opponentMoves.filter(m => m.to === square);
        
        if (attackingMoves.length === 0) return false;
        
        // Проверяем, защищена ли наша фигура
        return !this.isPieceDefended(square);
    }

    getPositionalAdvantage(move) {
        // Оценка позиционного преимущества хода
        let score = 0;
        
        // Контроль центра
        const centerSquares = ['d4', 'e4', 'd5', 'e5', 'c3', 'f3', 'c6', 'f6'];
        if (centerSquares.includes(move.to)) {
            score += 2;
        }
        
        // Развитие фигур
        const developmentSquares = {
            'n': ['c3', 'f3', 'c6', 'f6'], // Кони
            'b': ['c4', 'f4', 'c5', 'f5'], // Слоны
            'q': ['d2', 'd7'], // Ферзи
            'r': ['a1', 'h1', 'a8', 'h8'] // Ладьи
        };
        
        const piece = this.chess.get(move.from);
        if (piece && developmentSquares[piece.type]) {
            if (developmentSquares[piece.type].includes(move.to)) {
                score += 1.5;
            }
        }
        
        // Бонус за рокировку
        if (move.san === 'O-O' || move.san === 'O-O-O') {
            score += 3;
        }
        
        // Бонус за связку
        if (this.isPin(move)) {
            score += 2;
        }
        
        // Бонус за атаку на короля
        if (this.attacksKingZone(move)) {
            score += 1.5;
        }
        
        return score;
    }

    isPin(move) {
        // Проверяем, создает ли ход связку
        const piece = this.chess.get(move.from);
        if (!piece || piece.type === 'p' || piece.type === 'k') return false;
        
        // Временная доска для проверки
        const tempChess = new Chess(this.chess.fen());
        tempChess.move({ from: move.from, to: move.to });
        
        // Проверяем, находится ли король противника на линии атаки
        const opponentKingSquare = this.findKingSquare(piece.color === 'w' ? 'b' : 'w');
        if (!opponentKingSquare) return false;
        
        // Проверяем, атакует ли наша фигура короля по прямой линии
        const fileDiff = Math.abs(move.to.charCodeAt(0) - opponentKingSquare.charCodeAt(0));
        const rankDiff = Math.abs(parseInt(move.to[1]) - parseInt(opponentKingSquare[1]));
        
        // Для ферзя, ладьи, слона проверяем прямые линии
        if (piece.type === 'q' || piece.type === 'r') {
            if (fileDiff === 0 || rankDiff === 0) {
                // Проверяем, нет ли фигур между нами и королем
                return this.isClearPath(move.to, opponentKingSquare, tempChess);
            }
        }
        
        if (piece.type === 'q' || piece.type === 'b') {
            if (fileDiff === rankDiff) {
                return this.isClearPath(move.to, opponentKingSquare, tempChess);
            }
        }
        
        return false;
    }

    isClearPath(from, to, chess) {
        // Проверяем, свободен ли путь между двумя клетками
        const fromFile = from.charCodeAt(0);
        const fromRank = parseInt(from[1]);
        const toFile = to.charCodeAt(0);
        const toRank = parseInt(to[1]);
        
        const fileStep = Math.sign(toFile - fromFile);
        const rankStep = Math.sign(toRank - fromRank);
        
        let currentFile = fromFile + fileStep;
        let currentRank = fromRank + rankStep;
        
        while (currentFile !== toFile || currentRank !== toRank) {
            const square = String.fromCharCode(currentFile) + currentRank;
            if (chess.get(square)) {
                return false;
            }
            currentFile += fileStep;
            currentRank += rankStep;
        }
        
        return true;
    }

    attacksKingZone(move) {
        // Проверяем, атакует ли ход зону короля
        const opponentColor = this.currentPlayer === 'w' ? 'b' : 'w';
        const kingSquare = this.findKingSquare(opponentColor);
        if (!kingSquare) return false;
        
        // Зона короля - клетки вокруг короля
        const kingZone = this.getKingZone(kingSquare);
        return kingZone.includes(move.to);
    }

    getKingZone(kingSquare) {
        // Возвращает зону вокруг короля (3x3)
        const file = kingSquare.charCodeAt(0);
        const rank = parseInt(kingSquare[1]);
        const zone = [];
        
        for (let f = file - 1; f <= file + 1; f++) {
            for (let r = rank - 1; r <= rank + 1; r++) {
                if (f >= 97 && f <= 104 && r >= 1 && r <= 8) {
                    zone.push(String.fromCharCode(f) + r);
                }
            }
        }
        
        return zone;
    }

    isExpertPositionalMove(move) {
        // Позиционные ходы для эксперта
        const piece = this.chess.get(move.from);
        if (!piece) return false;
        
        // 1. Улучшение позиции фигур
        const goodSquares = {
            'p': ['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5'], // Пешки в центре
            'n': ['c3', 'f3', 'c6', 'f6', 'd5', 'e5', 'd4', 'e4'], // Кони в центре/аванпосты
            'b': ['c4', 'f4', 'c5', 'f5', 'd3', 'e3', 'd6', 'e6'], // Слоны на длинных диагоналях
            'r': ['d1', 'e1', 'd8', 'e8', 'c1', 'f1', 'c8', 'f8'], // Ладьи на открытых вертикалях
            'q': ['d2', 'e2', 'd7', 'e7'] // Ферзи за пешками
        };
        
        if (goodSquares[piece.type] && goodSquares[piece.type].includes(move.to)) {
            return true;
        }
        
        // 2. Создание проходной пешки
        if (piece.type === 'p') {
            const file = move.to[0];
            const rank = parseInt(move.to[1]);
            const opponentPawnFile = String.fromCharCode(file.charCodeAt(0));
            
            // Проверяем, нет ли пешек противника на этой вертикали
            const hasOpponentPawns = this.hasOpponentPawnsOnFile(file, piece.color);
            if (!hasOpponentPawns && (rank === 4 || rank === 5)) {
                return true; // Проходная пешка
            }
        }
        
        // 3. Контроль важных полей
        const importantSquares = ['d4', 'e4', 'd5', 'e5', 'f7', 'f2', 'c7', 'c2'];
        if (importantSquares.includes(move.to)) {
            return true;
        }
        
        return false;
    }

    hasOpponentPawnsOnFile(file, color) {
        // Проверяем, есть ли у противника пешки на этой вертикали
        const opponentColor = color === 'w' ? 'b' : 'w';
        
        for (let rank = 1; rank <= 8; rank++) {
            const square = file + rank;
            const piece = this.chess.get(square);
            if (piece && piece.type === 'p' && piece.color === opponentColor) {
                return true;
            }
        }
        
        return false;
    }

    getPositionalScore(move) {
        // Подробная оценка позиционного хода
        let score = this.getPositionalAdvantage(move);
        
        // Дополнительные бонусы
        const piece = this.chess.get(move.from);
        
        // Бонус за развитие в начале игры
        if (this.movesHistory.length < 10) {
            if (piece && (piece.type === 'n' || piece.type === 'b')) {
                score += 1;
            }
            if (move.san === 'e4' || move.san === 'd4' || move.san === 'e5' || move.san === 'd5') {
                score += 2; // Центральные пешки
            }
        }
        
        // Бонус за контроль центра
        const centerControl = this.getCenterControl(move);
        score += centerControl;
        
        // Бонус за безопасность короля
        if (this.improvesKingSafety(move)) {
            score += 1.5;
        }
        
        // Штраф за ослабление позиции
        if (this.weakensPosition(move)) {
            score -= 2;
        }
        
        return score;
    }

    getCenterControl(move) {
        // Оценка контроля центра
        const centerSquares = ['d4', 'e4', 'd5', 'e5'];
        let control = 0;
        
        // Ход в центр
        if (centerSquares.includes(move.to)) {
            control += 2;
        }
        
        // Атака на центр
        const attackedSquares = this.getAttackedSquares(move);
        const centerAttacks = attackedSquares.filter(sq => centerSquares.includes(sq));
        control += centerAttacks.length * 0.5;
        
        return control;
    }

    getAttackedSquares(move) {
        // Получаем клетки, которые атакует фигура после хода
        const tempChess = new Chess(this.chess.fen());
        tempChess.move({ from: move.from, to: move.to });
        
        const piece = tempChess.get(move.to);
        if (!piece) return [];
        
        const moves = tempChess.moves({ square: move.to, verbose: true });
        return moves.map(m => m.to);
    }

    improvesKingSafety(move) {
        // Проверяем, улучшает ли ход безопасность короля
        if (move.san === 'O-O' || move.san === 'O-O-O') {
            return true; // Рокировка всегда улучшает безопасность
        }
        
        const piece = this.chess.get(move.from);
        if (!piece || piece.type !== 'k') return false;
        
        // Ход королем в безопасное место
        const kingZone = this.getKingZone(move.to);
        const attackedSquares = this.getAttackedSquaresByOpponent();
        const safeSquares = kingZone.filter(sq => !attackedSquares.includes(sq));
        
        return safeSquares.length > 4; // Если больше 4 безопасных клеток вокруг
    }

    getAttackedSquaresByOpponent() {
        // Получаем все клетки, атакованные противником
        const tempChess = new Chess(this.chess.fen());
        const opponentColor = tempChess.turn() === 'w' ? 'b' : 'w';
        tempChess.turn = opponentColor; // Меняем ход на противника
        
        const moves = tempChess.moves({ verbose: true });
        return [...new Set(moves.map(m => m.to))]; // Уникальные клетки
    }

    weakensPosition(move) {
        // Проверяем, ослабляет ли ход позицию
        const piece = this.chess.get(move.from);
        
        // Ослабление пешечной структуры
        if (piece && piece.type === 'p') {
            const file = move.from[0];
            const adjacentFiles = [
                String.fromCharCode(file.charCodeAt(0) - 1),
                String.fromCharCode(file.charCodeAt(0) + 1)
            ].filter(f => f >= 'a' && f <= 'h');
            
            // Проверяем, остались ли изолированные пешки
            for (const adjFile of adjacentFiles) {
                const hasFriendlyPawns = this.hasFriendlyPawnsOnFile(adjFile, piece.color);
                if (!hasFriendlyPawns) {
                    return true; // Изолированная пешка
                }
            }
        }
        
        // Оставление фигуры без защиты
        if (this.isPieceHanging(move.from)) {
            return true;
        }
        
        // Создание слабостей вокруг короля
        if (this.createsKingWeakness(move)) {
            return true;
        }
        
        return false;
    }

    hasFriendlyPawnsOnFile(file, color) {
        // Проверяем, есть ли свои пешки на соседних вертикалях
        for (let rank = 1; rank <= 8; rank++) {
            const square = file + rank;
            const piece = this.chess.get(square);
            if (piece && piece.type === 'p' && piece.color === color) {
                return true;
            }
        }
        return false;
    }

    createsKingWeakness(move) {
        // Проверяем, создает ли ход слабости вокруг короля
        const piece = this.chess.get(move.from);
        if (!piece || piece.type !== 'p') return false;
        
        const kingColor = piece.color;
        const kingSquare = this.findKingSquare(kingColor);
        if (!kingSquare) return false;
        
        // Если пешка уходит от короля, оставляя слабости
        const fromFile = move.from.charCodeAt(0);
        const kingFile = kingSquare.charCodeAt(0);
        
        // Пешка рядом с королем уходит
        if (Math.abs(fromFile - kingFile) <= 1) {
            return true;
        }
        
        return false;
    }

    isExpertBadMove(move) {
        // Очень строгая проверка плохих ходов для эксперта
        const piece = this.chess.get(move.from);
        
        // 1. Очень плохие ходы (??)
        if (move.san.includes('??')) {
            return true;
        }
        
        // 2. Сомнительные ходы (?) с высокой вероятностью
        if (move.san.includes('?') && Math.random() < 0.9) {
            return true;
        }
        
        // 3. Ослабляющие ходы
        if (this.weakensPosition(move)) {
            return true;
        }
        
        // 4. Ходы в ловушки
        if (this.isTrapMove(move)) {
            return true;
        }
        
        // 5. Потеря материала без компенсации
        if (this.losesMaterial(move)) {
            return true;
        }
        
        return false;
    }

    isTrapMove(move) {
        // Проверяем, не ведет ли ход в ловушку
        const piece = this.chess.get(move.from);
        if (!piece) return false;
        
        // Проверяем, не попадает ли фигура под вилку
        const opponentColor = piece.color === 'w' ? 'b' : 'w';
        const tempChess = new Chess(this.chess.fen());
        tempChess.move({ from: move.from, to: move.to });
        tempChess.turn = opponentColor; // Теперь ход противника
        
        const opponentMoves = tempChess.moves({ verbose: true });
        
        // Ищем вилки (ходы, которые атакуют две фигуры одновременно)
        const forkMoves = opponentMoves.filter(oppMove => {
            const attackedPiece1 = this.chess.get(oppMove.to);
            if (!attackedPiece1 || attackedPiece1.color === opponentColor) return false;
            
            // Проверяем, атакует ли этот ход еще одну нашу фигуру
            const attackedSquares = this.getAttackedSquares(oppMove);
            const ourPieces = attackedSquares.filter(sq => {
                const p = tempChess.get(sq);
                return p && p.color === piece.color && sq !== oppMove.to;
            });
            
            return ourPieces.length > 0;
        });
        
        return forkMoves.length > 0;
    }

    losesMaterial(move) {
        // Проверяем, теряем ли мы материал без компенсации
        const piece = this.chess.get(move.from);
        if (!piece) return false;
        
        const pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };
        
        const ourPieceValue = pieceValues[piece.type] || 0;
        const capturedPiece = this.chess.get(move.to);
        const capturedValue = capturedPiece ? pieceValues[capturedPiece.type] || 0 : 0;
        
        // Если мы берем фигуру меньшей ценности, но наша фигура будет потеряна
        if (capturedValue > 0 && capturedValue < ourPieceValue) {
            if (this.isPieceHanging(move.from)) {
                return true; // Плохой размен
            }
        }
        
        // Если мы не берем ничего, но наша фигура под ударом
        if (capturedValue === 0 && this.isPieceHanging(move.from)) {
            return true; // Оставляем фигуру под боем
        }
        
        return false;
    }

    // Остальные методы остаются без изменений...

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

    // Обновляем updateStatus для отображения нового уровня
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

    // Остальные методы остаются без изменений...
}

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting chess game...');
    new ChessGame();
});
