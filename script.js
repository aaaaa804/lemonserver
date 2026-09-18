(() => {
    document.body.classList.add('js-ready');
    const prevent = (e) => e.preventDefault();
    ['contextmenu', 'dragstart', 'selectstart'].forEach(ev => {
        document.addEventListener(ev, prevent);
    });
    const blockedKeys = new Set(['c', 'v', 'u', 's']);
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && blockedKeys.has(e.key.toLowerCase()))) {
            prevent(e);
        }
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { 
                entry.target.classList.add('v'); 
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -32px 0px' });
    document.querySelectorAll('.r').forEach(el => observer.observe(el));

    // --- 미니게임 로직 ---
    const gameContainer = document.getElementById('game-container');
    const gameOverlay = document.getElementById('game-overlay');
    const gameStatusText = document.getElementById('game-status-text');
    const startBtn = document.getElementById('start-game-btn');
    const scoreDisplay = document.getElementById('game-score');
    const lemonCountDisplay = document.getElementById('lemon-count');
    const maxLemonDisplay = document.getElementById('max-lemon-display');
    const diffBtns = document.querySelectorAll('.diff-btn');

    let score = 0;
    let lemonCount = 0;
    let spawnTimer = null;
    let isPlaying = false;
    let currentSpeed = 800;
    let currentDifficulty = 'normal';

    const LEMON_SIZE = 36;

    // 난이도별 세팅 정의
    const DIFFICULTY_CONFIG = {
        normal: {
            maxLemons: 5,
            baseSpeed: 800,
            minSpeed: 250,
            stepScore: 5,
            stepSpeed: 100
        },
        hard: {
            maxLemons: 25,
            baseSpeed: 500,
            minSpeed: 100,
            stepScore: 10,
            stepSpeed: 100
        }
    };

    function getConfig() {
        return DIFFICULTY_CONFIG[currentDifficulty];
    }

    // 난이도 변경 핸들러
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isPlaying) return; // 게임 진행 중 변경 방지

            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentDifficulty = btn.dataset.diff;
            const config = getConfig();
            maxLemonDisplay.innerText = config.maxLemons;
        });
    });

    // 점수에 따른 속도 계산
    function calculateSpeed(currentScore) {
        const config = getConfig();
        const level = Math.floor(currentScore / config.stepScore);
        const newSpeed = config.baseSpeed - (level * config.stepSpeed);
        return Math.max(config.minSpeed, newSpeed);
    }

    function updateSpawnTimer() {
        if (!isPlaying) return;
        if (spawnTimer) clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnLemon, currentSpeed);
    }

    function spawnLemon() {
        if (!isPlaying) return;

        const config = getConfig();

        // 최대 레몬 수 도달 시 게임 종료
        if (lemonCount >= config.maxLemons) {
            endGame();
            return;
        }

        const lemon = document.createElement('div');
        lemon.className = 'lemon-target';
        lemon.innerText = '🍋';

        const maxX = gameContainer.clientWidth - LEMON_SIZE;
        const maxY = gameContainer.clientHeight - LEMON_SIZE;

        const randomX = Math.max(0, Math.floor(Math.random() * maxX));
        const randomY = Math.max(0, Math.floor(Math.random() * maxY));

        lemon.style.left = `${randomX}px`;
        lemon.style.top = `${randomY}px`;

        lemon.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            score += 1;
            lemonCount -= 1;
            scoreDisplay.innerText = score;
            lemonCountDisplay.innerText = lemonCount;
            lemon.remove();

            const newSpeed = calculateSpeed(score);
            if (newSpeed !== currentSpeed) {
                currentSpeed = newSpeed;
                updateSpawnTimer();
            }
        });

        gameContainer.appendChild(lemon);
        lemonCount += 1;
        lemonCountDisplay.innerText = lemonCount;

        if (lemonCount >= config.maxLemons) {
            endGame();
        }
    }

    function startGame() {
        document.querySelectorAll('.lemon-target').forEach(el => el.remove());

        const config = getConfig();
        score = 0;
        lemonCount = 0;
        isPlaying = true;
        currentSpeed = config.baseSpeed;

        scoreDisplay.innerText = score;
        lemonCountDisplay.innerText = lemonCount;
        maxLemonDisplay.innerText = config.maxLemons;

        gameOverlay.style.display = 'none';
        startBtn.innerText = '재시작';

        updateSpawnTimer();
        spawnLemon();
    }

    function endGame() {
        isPlaying = false;
        if (spawnTimer) clearInterval(spawnTimer);
        gameOverlay.style.display = 'flex';
        gameStatusText.innerText = `게임 종료! 최종 점수: ${score}점`;
        startBtn.innerText = '다시 시작';
    }

    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
})();
