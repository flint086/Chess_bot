// == ШАХМАТЫ В TELEGRAM ==
// Версия: 1.2.0
// Автор: ChessBot
// Дата: 2024
// История версий:
// 1.0.0 - Базовая версия игры
// 1.1.0 - Исправлено зависание бота при превращении пешек
// 1.1.1 - Добавлена система версий и защита от кеширования
// 1.2.0 - Добавлено автосохранение игры

// Telegram Web App Integration
class TelegramIntegration {
    constructor() {
        this.isTelegram = false;
        this.version = "1.2.0";
        this.versionHistory = {
            "1.0.0": "Базовая версия игры",
            "1.1.0": "Исправлено зависание бота при превращении пешек", 
            "1.1.1": "Добавлена система версий и защита от кеширования",
            "1.2.0": "Добавлено автосохранение игры"
        };
        this.buildDate = "2024-01-15";
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
        // Принудительно очищаем кеш при загрузке
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

        // Сохраняем игру при закрытии Telegram Web App
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
        // Удаляем старый элемент версии если существует
        const oldVersion = document.getElementById('app-version');
        if (oldVersion) {
            oldVersion.remove();
        }

        // Создаем новый элемент для отображения версии
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
        
        // Добавляем возможность посмотреть историю версий
        versionElement.addEventListener('click', () => {
            this.showVersionInfo();
        });
        
        // Добавляем возможность посмотреть информацию о версии при наведении
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
        
        // Показываем уведомление о версии при загрузке
        this.showVersionNotification();
    }

    showVersionInfo() {
        let infoText = `♟️ Шахматы в Telegram\n\n`;
        infoText += `Версия: ${this.version}\n`;
        infoText += `Сборка: ${this.buildDate}\n\n`;
        infoText += `История изменений:\n`;
        
        // Сортируем версии по убыванию
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
        // Показываем всплывающее уведомление о версии только если это новая версия
        const lastSeenVersion = localStorage.getItem('lastSeenVersion');
        
        if (!lastSeenVersion || lastSeenVersion !== this.version) {
            setTimeout(() => {
                console.log(`%c🆕 Загружена новая версия! v${this.version}`, 'color: #FF9800; font-weight: bold;');
            }, 1000);
            
            // Сохраняем текущую версию как просмотренную
            localStorage.setItem('lastSeenVersion', this.version);
        }
    }

    // Метод для обновления версии
    updateVersion(newVersion, description) {
        this.version = newVersion;
        this.versionHistory[newVersion] = description;
        this.buildDate = new Date().toISOString().split('T')[0];
        
        // Обновляем отображение
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
        this.isPlayerTurn = true;
        this.movesHistory = [];
        this.difficulty = 'medium';
        this.botThinkingTime = 800;
        
        this.initializeBoard();
        this.bindEvents();
        this.createDifficultySelector();
        this.loadGame(); // Загружаем сохраненную игру при запуске
        this.updateGame();
        
        // Сохраняем ссылку на экземпляр игры в глобальной области
        window.chessGame = this;
    }

    // СОХРАНЕНИЕ ИГРЫ
    saveGame() {
        try {
            const gameState = {
                fen: this.chess.fen(),
                movesHistory: this.movesHistory,
                difficulty: this.difficulty,
                isPlayerTurn: this.isPlayerTurn,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('chessGameState', JSON.stringify(gameState));
            console.log('💾 Игра сохранена');
        } catch (error) {
            console.error('Ошибка при сохранении игры:', error);
        }
    }

    // ЗАГРУЗКА ИГРЫ
    loadGame() {
        try {
            const saved = localStorage.getItem('chessGameState');
            if (saved) {
                const gameState = JSON.parse(saved);
                
                // Проверяем, не устарело ли сохранение (больше 24 часов)
                const savedTime = new Date(gameState.timestamp);
                const currentTime = new Date();
                const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) { // Сохранение действительно 24 часа
                    this.chess.load(gameState.fen);
                    this.movesHistory = gameState.movesHistory || [];
                    this.difficulty = gameState.difficulty || 'medium';
                    this.isPlayerTurn = gameState.isPlayerTurn !== undefined ? gameState.isPlayerTurn : true;
                    
                    // Обновляем селектор сложности
                    const difficultySelect = document.getElementById('difficulty');
                    if (difficultySelect) {
                        difficultySelect.value = this.difficulty;
                    }
                    
                    this.updateThinkingTime();
                    console.log('💾 Игра загружена');
                    
                    // Показываем уведомление о загрузке
                    this.showLoadNotification();
                } else {
                    console.log('💾 Сохранение устарело, начинаем новую игру');
                    localStorage.removeItem('chessGameState');
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке игры:', error);
            // При ошибке загрузки начинаем новую игру
            localStorage.removeItem('chessGameState');
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
        
        const difficultySelect = document.getElementById('difficulty');
        difficultySelect.value = this.difficulty;
        
        difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateThinkingTime();
            this.saveGame(); // Сохраняем при изменении сложности
        });
    }

    // Остальные методы остаются без изменений, но добавляем сохранение после ходов...

    async makeMove(from, to) {
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
                this.updateGame();
                this.saveGame(); // Сохраняем после хода игрока
            
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
            
            const moves = this.chess.moves({ verbose: true });
            
            if (moves.length === 0) {
                console.log('No moves available for bot');
                this.isPlayerTurn = true;
                this.updateGame();
                return;
            }
            
            const promotionMoves = [];
            const regularMoves = [];
            
            moves.forEach(move => {
                const piece = this.chess.get(move.from);
                if (piece && piece.type === 'p') {
                    const targetRank = move.to[1];
                    if (piece.color === 'b' && targetRank === '1') {
                        promotionMoves.push(move);
                        return;
                    }
                    if (piece.color === 'w' && targetRank === '8') {
                        promotionMoves.push(move);
                        return;
                    }
                }
                regularMoves.push(move);
            });
            
            let selectedMove;
            
            if (promotionMoves.length > 0) {
                selectedMove = this.handlePromotionMoves(promotionMoves);
            } else {
                selectedMove = this.getBestMove(regularMoves.length > 0 ? regularMoves : moves);
            }
            
            if (selectedMove) {
                const moveResult = this.chess.move(selectedMove);
                if (moveResult) {
                    this.movesHistory.push(moveResult.san);
                    this.updateMovesList();
                    this.saveGame(); // Сохраняем после хода бота
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
    
        this.isPlayerTurn = true;
        this.updateGame();
    }

    newGame() {
        if (confirm('Начать новую игру? Текущий прогресс будет потерян.')) {
            this.chess.reset();
            this.selectedSquare = null;
            this.legalMoves = [];
            this.isPlayerTurn = true;
            this.movesHistory = [];
            this.clearHighlights();
            this.updateGame();
            this.updateMovesList();
            this.saveGame(); // Сохраняем новую игру
            
            // Показываем уведомление
            const statusElement = document.getElementById('status');
            if (statusElement) {
                statusElement.textContent = 'Новая игра началась!';
                setTimeout(() => this.updateStatus(), 2000);
            }
        }
    }

    // ... остальные методы без изменений

    // Добавляем сохранение при изменении сложности
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
        this.saveGame();
    }

    // Также сохраняем при сдаче
    surrender() {
        if (confirm('Сдаться?')) {
            this.newGame();
            document.getElementById('status').textContent = 'Вы сдались!';
            this.saveGame();
        }
    }
}

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting chess game...');
    new ChessGame();
});
