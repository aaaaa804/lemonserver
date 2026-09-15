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

    let score = 0;
    let lemonCount = 0;
    let spawnTimer = null;
    let isPlaying = false;
    let currentSpeed = 800; // 초기 레몬 스폰 간격 (0.8초)

    const LEMON_SIZE = 36; // 레몬 요소 크기(px)
    const BASE_SPEED = 800; // 시작 속도(ms)
    const MIN_SPEED = 250;  // 최고 난이도 속도 제한(ms)

    // 점수에 따른 스폰 속도 계산 함수 (5점마다 100ms 감소)
    function calculateSpeed(currentScore) {
        const level = Math.floor(currentScore / 5);
        const newSpeed = BASE_SPEED - (level * 100);
        return Math.max(MIN_SPEED, newSpeed);
    }

    // 스폰 타이머 재설정 함수
    function updateSpawnTimer() {
        if (!isPlaying) return;
        if (spawnTimer) clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnLemon, currentSpeed);
    }

    function spawnLemon() {
        if (!isPlaying) return;

        // 화면 내 레몬 수 10개 이상 시 게임 종료
        if (lemonCount >= 10) {
            endGame();
            return;
        }

        const lemon = document.createElement('div');
        lemon.className = 'lemon-target';
        lemon.innerText = '🍋';

        // 게임 영역 경계를 벗어나지 않도록 좌표 계산
        const maxX = gameContainer.clientWidth - LEMON_SIZE;
        const maxY = gameContainer.clientHeight - LEMON_SIZE;

        const randomX = Math.max(0, Math.floor(Math.random() * maxX));
        const randomY = Math.max(0, Math.floor(Math.random() * maxY));

        lemon.style.left = `${randomX}px`;
        lemon.style.top = `${randomY}px`;

        // 레몬 클릭 이벤트 (점수 획득)
        lemon.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            score += 1;
            lemonCount -= 1;
            scoreDisplay.innerText = score;
            lemonCountDisplay.innerText = lemonCount;
            lemon.remove();

            // 점수 증가에 따른 속도 변화 검사 및 타이머 재설정
            const newSpeed = calculateSpeed(score);
            if (newSpeed !== currentSpeed) {
                currentSpeed = newSpeed;
                updateSpawnTimer();
            }
        });

        gameContainer.appendChild(lemon);
        lemonCount += 1;
        lemonCountDisplay.innerText = lemonCount;

        if (lemonCount >= 5) {
            endGame();
        }
    }

    function startGame() {
        // 기존 레몬 제거
        document.querySelectorAll('.lemon-target').forEach(el => el.remove());

        score = 0;
        lemonCount = 0;
        isPlaying = true;
        currentSpeed = BASE_SPEED;

        scoreDisplay.innerText = score;
        lemonCountDisplay.innerText = lemonCount;

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