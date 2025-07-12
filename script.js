
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const restartBtn = document.getElementById('restartBtn');
    const playerXScore = document.getElementById('playerXScore');
    const playerOScore = document.getElementById('playerOScore');
    const drawScore = document.getElementById('drawScore');
    const audioControl = document.getElementById('audioControl');

    // Audio elements
    const clickSound = document.getElementById('clickSound');
    const winSound = document.getElementById('winSound');
    const drawSound = document.getElementById('drawSound');
    const backgroundMusic = document.getElementById('backgroundMusic');

    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let scores = { X: 0, O: 0, draw: 0 };
    let isMusicPlaying = true;
    let isSoundOn = true;
    let isAgainstAI = true;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    init();

    function init() {
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        restartBtn.addEventListener('click', restartGame);
        audioControl.addEventListener('click', toggleBackgroundMusic);

        backgroundMusic.volume = 0.3;
        backgroundMusic.play().catch(() => {
            document.body.addEventListener('click', () => backgroundMusic.play(), { once: true });
        });
        audioControl.textContent = '🔊';

        updateStatus();
    }

    function toggleBackgroundMusic() {
        isMusicPlaying = !isMusicPlaying;

        if (isMusicPlaying) {
            backgroundMusic.volume = 0.3;
            backgroundMusic.play().catch(() => {
                document.body.addEventListener('click', () => backgroundMusic.play(), { once: true });
            });
            audioControl.textContent = '🔊';
        } else {
            backgroundMusic.volume = 0;
            audioControl.textContent = '🔇';
        }
    }

    function playSound(sound) {
        if (!isSoundOn) return;
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play prevented"));
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        if (gameState[clickedCellIndex] !== '' || !gameActive) return;

        playSound(clickSound);

        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());

        if (checkWin()) {
            handleWin();
            return;
        } else if (checkDraw()) {
            handleDraw();
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();

        if (isAgainstAI && currentPlayer === 'O' && gameActive) {
            setTimeout(() => {
                makeAIMove();
            }, 500);
        }
    }

    function makeAIMove() {
        let bestScore = -Infinity;
        let bestMove;

        for (let i = 0; i < 9; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'O';
                let score = minimax(gameState, 0, false);
                gameState[i] = '';

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        if (bestMove !== undefined) {
            const cell = document.querySelector(`.cell[data-index="${bestMove}"]`);
            cell.click();
        }
    }

    function minimax(board, depth, isMaximizing) {
        if (checkWin('O')) return 10 - depth;
        if (checkWin('X')) return depth - 10;
        if (checkDraw()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function checkWin(player = currentPlayer) {
        return winningConditions.some(condition => {
            return condition.every(index => gameState[index] === player);
        });
    }

    function checkDraw() {
        return !gameState.includes('');
    }

    function handleWin() {
        playSound(winSound);
        status.textContent = `Player ${currentPlayer} Won!`;
        gameActive = false;

        scores[currentPlayer]++;
        updateScore();

        const winningCombination = winningConditions.find(condition => {
            return condition.every(index => gameState[index] === currentPlayer);
        });

        if (winningCombination) {
            winningCombination.forEach(index => {
                document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning-cell');
            });
        }

        createConfetti();
    }

    function handleDraw() {
        playSound(drawSound);
        status.textContent = 'The game is a draw!';
        gameActive = false;

        scores.draw++;
        updateScore();
    }

    function updateStatus() {
        status.textContent = `Player ${currentPlayer} It's your turn.`;
    }

    function updateScore() {
        playerXScore.textContent = scores.X;
        playerOScore.textContent = scores.O;
        drawScore.textContent = scores.draw;
    }

    function restartGame() {
        playSound(clickSound);

        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;

        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'winning-cell');
        });

        updateStatus();
    }

    function createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;

            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }
});
