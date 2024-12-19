class Card {
    constructor(value) {
        this.value = value;
        this.isUp = this.checkIsUp();
    }

    checkIsUp() {
        return ['8', '9', '10', 'J', 'Q', 'K', 'A'].includes(this.value);
    }

    compare(otherCard) {
        if (this.value === otherCard.value) return 0;
        
        if (this.value === '2' && otherCard.value === 'A') return 1;
        if (this.value === 'A' && otherCard.value === '2') return -1;
        
        if (this.value === '2') return -1;
        if (otherCard.value === '2') return 1;
        
        const cardValues = {
            '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
            '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        
        return cardValues[this.value] - cardValues[otherCard.value];
    }
}

class Game {
    constructor() {
        this.deck = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.playerCards = [];
        this.computerCards = [];
        this.selectedCard = null;
        this.gameStatus = 'waiting';
        this.playerCharacter = document.querySelector('input[name="character"]:checked').value;
        this.battleHistory = [];
        this.roundCount = 0;
        this.playerChips = 0;
        this.computerChips = 0;
        this.initGame();
    }

    initGame() {
        // 重置牌堆
        this.deck = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.playerCards = [];
        this.computerCards = [];
        this.gameStatus = 'playing';
        
        // 更新玩家名称
        const playerName = this.playerCharacter === 'kaiji' ? '伊藤开司' : '兵藤和也';
        const computerName = this.playerCharacter === 'kaiji' ? '兵藤和也' : '伊藤开司';
        
        document.querySelector('.player-area h2').textContent = playerName;
        document.querySelector('.player-area:last-child h2').textContent = computerName;
        
        // 重置对战记录
        this.battleHistory = [];
        this.roundCount = 0;
        
        // 设置初始筹码数
        if (this.playerCharacter === 'kaiji') {
            this.playerChips = 2;    // 伊藤开司方2个筹码
            this.computerChips = 10;  // 兵藤和也方10个筹码
        } else {
            this.playerChips = 10;    // 兵藤和也方10个筹码
            this.computerChips = 2;   // 伊藤开司方2个筹码
        }
        
        this.updateChipsDisplay();
        
        // 初始发牌
        this.drawCards(2);
        
        // 更新界面
        this.updateStatus();
        this.updateBattleHistory();
        this.setupCardListeners();
    }

    setupCardListeners() {
        const playerCardsDiv = document.getElementById('player-cards');
        playerCardsDiv.addEventListener('click', (e) => {
            if (this.gameStatus !== 'playing') return;
            
            if (e.target.classList.contains('card')) {
                const cardIndex = parseInt(e.target.dataset.index);
                this.playRound(cardIndex);
            }
        });
    }

    playRound(playerCardIndex) {
        const playerCard = this.playerCards[playerCardIndex];
        const computerCardIndex = Math.floor(Math.random() * this.computerCards.length);
        const computerCard = this.computerCards[computerCardIndex];
        const result = playerCard.compare(computerCard);
        
        // 更新筹码数
        if (result > 0) {
            // 玩家胜利
            this.playerChips++;
            this.computerChips--;
        } else if (result < 0) {
            // 电脑胜利
            this.computerChips++;
            this.playerChips--;
        }
        // 平局不改变筹码数

        // 检查游戏是否结束
        if (this.playerChips <= 0 || this.computerChips <= 0) {
            this.gameStatus = 'ended';
            this.showGameOver(this.playerChips <= 0);
            return;
        }

        this.updateChipsDisplay();
        
        // 记录对战结果
        this.recordBattle(playerCard, computerCard, result);
        
        // 创建对决区域
        this.showBattle(playerCard, computerCard, result);

        // 将使用过的牌放回牌堆
        this.deck.push(playerCard.value);
        this.deck.push(computerCard.value);

        // 移除已使用的牌
        this.playerCards.splice(playerCardIndex, 1);
        this.computerCards.splice(computerCardIndex, 1);

        // 补充手牌到2张
        while (this.playerCards.length < 2 || this.computerCards.length < 2) {
            this.drawCards(1);
        }

        this.updateStatus();
    }

    recordBattle(playerCard, computerCard, result) {
        this.roundCount++;
        this.battleHistory.push({
            round: this.roundCount,
            playerCard: playerCard.value,
            computerCard: computerCard.value,
            result: result
        });
        
        if (this.battleHistory.length > 20) {
            this.battleHistory.shift();
        }
        this.updateBattleHistory();
    }

    updateBattleHistory() {
        const playerHistoryRow = document.getElementById('player-history');
        const computerHistoryRow = document.getElementById('computer-history');
        
        // 清空现有记录
        playerHistoryRow.innerHTML = '';
        computerHistoryRow.innerHTML = '';

        // 添加名字列
        const playerNameCell = document.createElement('td');
        const computerNameCell = document.createElement('td');
        playerNameCell.style.border = '1px solid #ccc';
        computerNameCell.style.border = '1px solid #ccc';
        playerNameCell.style.padding = '5px';
        computerNameCell.style.padding = '5px';
        playerNameCell.style.fontWeight = 'bold';
        computerNameCell.style.fontWeight = 'bold';
        playerNameCell.style.width = '100px';
        computerNameCell.style.width = '100px';

        // 设置玩家名称
        const playerName = this.playerCharacter === 'kaiji' ? '伊藤开司' : '兵藤和也';
        const computerName = this.playerCharacter === 'kaiji' ? '兵藤和也' : '伊藤开司';
        playerNameCell.textContent = playerName;
        computerNameCell.textContent = computerName;

        playerHistoryRow.appendChild(playerNameCell);
        computerHistoryRow.appendChild(computerNameCell);

        // 填充20个空格子
        for (let i = 0; i < 20; i++) {
            const playerCell = document.createElement('td');
            const computerCell = document.createElement('td');
            playerCell.style.border = '1px solid #ccc';
            computerCell.style.border = '1px solid #ccc';
            playerCell.style.padding = '5px';
            computerCell.style.padding = '5px';
            playerCell.textContent = '-';
            computerCell.textContent = '-';
            playerHistoryRow.appendChild(playerCell);
            computerHistoryRow.appendChild(computerCell);
        }

        // 添加对战记录，直接修改对应位置的格子内容
        this.battleHistory.forEach((record, index) => {
            const playerCell = playerHistoryRow.children[index + 1];  // +1 因为第一列是名字
            const computerCell = computerHistoryRow.children[index + 1];

            playerCell.textContent = record.playerCard;
            computerCell.textContent = record.computerCard;

            if (record.result > 0) {
                playerCell.style.backgroundColor = '#e8f5e9';
                computerCell.style.backgroundColor = '#ffebee';
            } else if (record.result < 0) {
                playerCell.style.backgroundColor = '#ffebee';
                computerCell.style.backgroundColor = '#e8f5e9';
            } else {
                playerCell.style.backgroundColor = '#f5f5f5';
                computerCell.style.backgroundColor = '#f5f5f5';
            }
        });
    }

    showBattle(playerCard, computerCard, result) {
        const battleDiv = document.createElement('div');
        battleDiv.style.position = 'fixed';
        battleDiv.style.top = '50%';
        battleDiv.style.left = '50%';
        battleDiv.style.transform = 'translate(-50%, -50%)';
        battleDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        battleDiv.style.padding = '20px';
        battleDiv.style.border = '2px solid black';
        battleDiv.style.borderRadius = '10px';
        battleDiv.style.zIndex = '1000';

        const playerName = this.playerCharacter === 'kaiji' ? '伊藤开司' : '兵藤和也';
        const computerName = this.playerCharacter === 'kaiji' ? '兵藤和也' : '伊藤开司';
        
        const resultText = result > 0 ? `${playerName}胜利！` : (result < 0 ? `${computerName}胜利！` : '平局！');
        
        battleDiv.innerHTML = `
            <div style="text-align: center;">
                <h3>对决结果</h3>
                <p>${playerName}出牌: ${playerCard.value}</p>
                <p>${computerName}出牌: ${computerCard.value}</p>
                <p style="font-weight: bold;">${resultText}</p>
                <button onclick="this.parentElement.parentElement.remove()">确定</button>
            </div>
        `;

        document.body.appendChild(battleDiv);
    }

    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length > 0) {
                const playerIndex = Math.floor(Math.random() * this.deck.length);
                const playerCard = new Card(this.deck.splice(playerIndex, 1)[0]);
                this.playerCards.push(playerCard);

                const computerIndex = Math.floor(Math.random() * this.deck.length);
                const computerCard = new Card(this.deck.splice(computerIndex, 1)[0]);
                this.computerCards.push(computerCard);
            }
        }
    }

    updateStatus() {
        const playerStatus = {
            up: this.playerCards.filter(card => card.isUp).length,
            down: this.playerCards.filter(card => !card.isUp).length
        };

        const computerStatus = {
            up: this.computerCards.filter(card => card.isUp).length,
            down: this.computerCards.filter(card => !card.isUp).length
        };

        document.getElementById('player-status').textContent = 
            `UP牌: ${playerStatus.up} | DOWN牌: ${playerStatus.down}`;
        document.getElementById('computer-status').textContent = 
            `UP牌: ${computerStatus.up} | DOWN牌: ${computerStatus.down}`;

        this.renderCards();
    }

    renderCards() {
        const playerCardsDiv = document.getElementById('player-cards');
        const computerCardsDiv = document.getElementById('computer-cards');

        playerCardsDiv.innerHTML = '';
        computerCardsDiv.innerHTML = '';

        this.playerCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.textContent = card.value;
            cardElement.style.backgroundColor = card.isUp ? '#e8f5e9' : '#ffebee';
            cardElement.dataset.index = index;
            playerCardsDiv.appendChild(cardElement);
        });

        this.computerCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.textContent = '?';
            computerCardsDiv.appendChild(cardElement);
        });
    }

    updateChipsDisplay() {
        document.getElementById('player-chips').textContent = `剩余生命: ${this.playerChips}`;
        document.getElementById('computer-chips').textContent = `剩余生命: ${this.computerChips}`;
    }

    // 添加游戏结束显示方法
    showGameOver(playerLost) {
        const battleDiv = document.createElement('div');
        battleDiv.style.position = 'fixed';
        battleDiv.style.top = '50%';
        battleDiv.style.left = '50%';
        battleDiv.style.transform = 'translate(-50%, -50%)';
        battleDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        battleDiv.style.padding = '20px';
        battleDiv.style.border = '2px solid black';
        battleDiv.style.borderRadius = '10px';
        battleDiv.style.zIndex = '1000';

        const playerName = this.playerCharacter === 'kaiji' ? '伊藤开司' : '兵藤和也';
        const computerName = this.playerCharacter === 'kaiji' ? '兵藤和也' : '伊藤开司';
        const loserName = playerLost ? playerName : computerName;

        battleDiv.innerHTML = `
            <div style="text-align: center;">
                <h3>游戏结束</h3>
                <p>${loserName}失去了所有生命</p>
                <button onclick="location.reload()">重新开始</button>
            </div>
        `;

        document.body.appendChild(battleDiv);
    }
}

document.getElementById('start-game').addEventListener('click', () => {
    new Game();
}); 