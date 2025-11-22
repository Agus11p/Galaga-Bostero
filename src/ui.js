export class UIManager {
    constructor(state, gameEngine) {
        this.state = state;
        this.game = gameEngine;
    }

    init() {
        // Common: Gamepad polling
        this.lastButtonState = {};
        this.lastAxisState = {};
        this.navCooldown = 0;
        requestAnimationFrame(() => this.pollGamepad());

        // Initialize all screens
        this.initLogin();
        this.initMenu();
        this.initGame();
        this.initShop();
        this.initAchievements();
        this.initRanking();
        this.initGameOver();

        // Determine start screen
        if (this.state.isLoggedIn()) {
            this.showScreen('screen-menu');
            this.updateMenu();
        } else {
            this.showScreen('screen-login');
        }

        // Auto-focus first element
        setTimeout(() => {
            const firstInteractive = document.querySelector('.screen.active button, .screen.active input');
            if (firstInteractive) firstInteractive.focus();
        }, 100);

        // Global Keyboard Navigation for Menus
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                // Prioritize pause screen if active
                const pauseScreen = document.getElementById('screen-pause');
                if (pauseScreen && pauseScreen.classList.contains('active')) {
                    this.handleMenuNavigation(e, pauseScreen);
                    return;
                }

                const activeScreen = document.querySelector('.screen.active');
                // Don't navigate if in game (game handles its own inputs)
                if (activeScreen && activeScreen.id !== 'screen-game') {
                    this.handleMenuNavigation(e, activeScreen);
                }
            }
        });

        // Global game events (registered once)
        window.addEventListener('gameover', () => {
            // Small delay to ensure game state is saved
            setTimeout(() => {
                this.showGameOver();
            }, 100);
        });

        window.addEventListener('gamepause', () => {
            const pauseScreen = document.getElementById('screen-pause');
            if (pauseScreen && !pauseScreen.classList.contains('active')) {
                pauseScreen.classList.remove('hidden');
                pauseScreen.classList.add('active');
                setTimeout(() => document.getElementById('btn-resume').focus(), 100);
            }
        });

        // Achievement unlocked notification
        window.addEventListener('achievement', (e) => {
            this.showNotification(
                '🏆 ¡Logro Desbloqueado!',
                `${e.detail.id} - Ganaste ${e.detail.reward} monedas`,
                'achievement'
            );
            this.updateMenu(); // Update coins display
        });

        // Power-up collected notification
        window.addEventListener('powerup', (e) => {
            this.showNotification(
                '⚡ Power-Up!',
                e.detail.name,
                'default'
            );
        });
    }

    handleMenuNavigation(e, screen = null) {
        const activeScreen = screen || document.querySelector('.screen.active');
        const buttons = Array.from(activeScreen.querySelectorAll('button:not(.hidden), input:not(.hidden)'));
        if (buttons.length === 0) return;

        const currentIndex = buttons.indexOf(document.activeElement);
        let nextIndex = currentIndex;

        if (currentIndex === -1) {
            nextIndex = 0;
        } else {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % buttons.length;
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
            }
        }

        buttons[nextIndex].focus();
        e.preventDefault(); // Prevent scrolling
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
            // Focus first element
            setTimeout(() => {
                const first = target.querySelector('button, input');
                if (first) first.focus();
            }, 50);
        }
    }

    initLogin() {
        // Bind Login Events
        const btnLogin = document.getElementById('btn-login');
        if (btnLogin) {
            btnLogin.addEventListener('click', () => {
                if (this.state.isLoggedIn()) {
                    this.showScreen('screen-menu');
                    this.updateMenu();
                } else {
                    document.getElementById('login-form').classList.remove('hidden');
                    document.querySelector('.buttons-container').classList.add('hidden');
                    setTimeout(() => document.getElementById('input-name').focus(), 50);
                }
            });
        }

        const btnRegister = document.getElementById('btn-register');
        if (btnRegister) {
            btnRegister.addEventListener('click', () => {
                document.getElementById('login-form').classList.remove('hidden');
                document.querySelector('.buttons-container').classList.add('hidden');
                setTimeout(() => document.getElementById('input-name').focus(), 50);
            });
        }

        const btnSubmit = document.getElementById('btn-submit-login');
        if (btnSubmit) {
            btnSubmit.addEventListener('click', () => {
                const name = document.getElementById('input-name').value;
                const dni = document.getElementById('input-dni').value;
                if (name && dni) {
                    this.state.registerUser(name, dni);
                    this.showWelcomeScreen();
                } else {
                    alert('¡Che, completá los datos!');
                }
            });
        }

        // Welcome Screen Events
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('screen-welcome').classList.contains('active')) {
                this.showScreen('screen-menu');
                this.updateMenu();
            }
        });
        const welcomeBtn = document.querySelector('#screen-welcome button');
        if (welcomeBtn) {
            welcomeBtn.addEventListener('click', () => {
                this.showScreen('screen-menu');
                this.updateMenu();
            });
        }
    }

    initMenu() {
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                switch (action) {
                    case 'play':
                        this.showScreen('screen-game');
                        this.game.start();
                        break;
                    case 'shop':
                        this.showScreen('screen-shop');
                        this.renderShop();
                        break;
                    case 'achievements':
                        this.showScreen('screen-achievements');
                        this.renderAchievements();
                        break;
                    case 'ranking':
                        this.showScreen('screen-ranking');
                        this.renderRanking();
                        break;
                }
            });
        });
    }

    initGame() {
        // Focus canvas for controls
        setTimeout(() => {
            const canvas = document.getElementById('game-canvas');
            if (canvas) canvas.focus();
        }, 100);

        document.getElementById('btn-resume').addEventListener('click', () => {
            this.togglePause();
        });
    }

    initShop() {
        const btnBack = document.querySelector('#screen-shop .btn-back');
        if (btnBack) btnBack.addEventListener('click', () => {
            this.showScreen('screen-menu');
            this.updateMenu();
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const category = e.target.dataset.tab;
                this.renderShop(category);
            });
        });
    }

    initAchievements() {
        const btnBack = document.querySelector('#screen-achievements .btn-back');
        if (btnBack) btnBack.addEventListener('click', () => {
            this.showScreen('screen-menu');
            this.updateMenu();
        });
    }

    initRanking() {
        const btnBack = document.querySelector('#screen-ranking .btn-back');
        if (btnBack) btnBack.addEventListener('click', () => {
            this.showScreen('screen-menu');
            this.updateMenu();
        });
    }

    initGameOver() {
        document.getElementById('btn-menu').addEventListener('click', () => {
            this.showScreen('screen-menu');
            this.updateMenu();
        });
    }

    showGameOver() {
        console.log('UI: Showing Game Over screen');
        this.showScreen('screen-gameover');
        // Load stats from localStorage (passed via GameEngine saving to state/localstorage)
        const lastRun = JSON.parse(localStorage.getItem('galaga_last_run') || '{}');

        document.getElementById('result-kills').textContent = lastRun.kills || 0;
        document.getElementById('result-time').textContent = lastRun.timeString || "00:00";
        document.getElementById('result-bonus').textContent = lastRun.bonus || 0;
        document.getElementById('result-total').textContent = lastRun.score || 0; // This is the total score
        document.getElementById('result-coins').textContent = lastRun.coins || 0;
    }

    pollGamepad() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0];

        if (gp) {
            const now = Date.now();
            if (now - this.navCooldown > 150) {
                const axisV = gp.axes[1];
                const up = gp.buttons[12].pressed || axisV < -0.5;
                const down = gp.buttons[13].pressed || axisV > 0.5;
                const left = gp.buttons[14].pressed || gp.axes[0] < -0.5;
                const right = gp.buttons[15].pressed || gp.axes[0] > 0.5;

                if (up || down || left || right) {
                    this.navigateMenu(up, down, left, right);
                    this.navCooldown = now;
                }
            }

            if (gp.buttons[0].pressed && !this.lastButtonState[0]) {
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.tagName === 'INPUT')) {
                    activeElement.click();
                }
            }

            if (gp.buttons[9].pressed && !this.lastButtonState[9]) {
                if (document.getElementById('screen-game').classList.contains('active')) {
                    this.togglePause();
                }
            }

            for (let i = 0; i < gp.buttons.length; i++) {
                this.lastButtonState[i] = gp.buttons[i].pressed;
            }
        }

        requestAnimationFrame(() => this.pollGamepad());
    }

    navigateMenu(up, down, left, right) {
        // Get all visible buttons/inputs in the active screen
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;

        const buttons = Array.from(activeScreen.querySelectorAll('button:not(.hidden), input:not(.hidden)'));

        if (buttons.length === 0) return;

        const currentIndex = buttons.indexOf(document.activeElement);
        let nextIndex = currentIndex;

        if (currentIndex === -1) {
            nextIndex = 0;
        } else {
            if (down || right) {
                nextIndex = (currentIndex + 1) % buttons.length;
            } else if (up || left) {
                nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
            }
        }

        buttons[nextIndex].focus();
    }

    togglePause() {
        this.game.togglePause();
        const pauseScreen = document.getElementById('screen-pause');
        if (this.game.isPaused) {
            pauseScreen.classList.remove('hidden');
            pauseScreen.classList.add('active');
            setTimeout(() => document.getElementById('btn-resume').focus(), 100);
        } else {
            pauseScreen.classList.remove('active');
            pauseScreen.classList.add('hidden');
            document.activeElement.blur();
            document.getElementById('game-canvas').focus();
        }
    }

    showWelcomeScreen() {
        this.showScreen('screen-welcome');
        const user = this.state.getUser();
        document.getElementById('carnet-name').textContent = user.name;
        document.getElementById('carnet-number').textContent = 'Nº ' + user.socioId;
    }

    updateMenu() {
        const user = this.state.getUser();
        const profile = this.state.data.profile;

        if (user) {
            // Update profile card
            document.getElementById('menu-user-name').textContent = user.name;
            document.getElementById('menu-user-title').textContent = profile.title;
            document.getElementById('menu-user-socio').textContent = `Socio Nº ${user.socioId}`;

            // Update level and XP
            document.getElementById('menu-level').textContent = profile.level;
            const xpForNextLevel = profile.level * 100;
            const xpPercent = (profile.xp / xpForNextLevel) * 100;
            document.getElementById('menu-xp-fill').style.width = `${xpPercent}%`;
            document.getElementById('menu-xp-text').textContent = `${profile.xp}/${xpForNextLevel}`;

            // Update stats
            document.getElementById('menu-coins').textContent = this.state.getCoins();
            document.getElementById('menu-kills').textContent = this.state.data.stats.totalKills;
            document.getElementById('menu-high-score').textContent = this.state.data.stats.highScore;
        }
    }

    showAchievements() {
        const unlocks = this.state.data.unlocks;
        let msg = "LOGROS:\n\n";
        msg += unlocks.sudamericana2023 ? "✅ Sudamericana 2023 (80k kills)\n" : "❌ Sudamericana 2023 (80k kills)\n";
        msg += unlocks.libertadores ? "✅ Copa Libertadores (150k kills)\n" : "❌ Copa Libertadores (150k kills)\n";
        msg += unlocks.intercontinental2000 ? "✅ Intercontinental 2000 (2.6M kills)\n" : "❌ Intercontinental 2000 (2.6M kills)\n";
        alert(msg);
    }

    watchAd() {
        alert('Viendo anuncio... (mentira, tomá 100 monedas)');
        this.state.addCoins(100);
        this.updateMenu();
    }

    renderShop() {
        import('./shop-config.js').then(module => {
            const { SHOP_CONFIG } = module;
            const container = document.getElementById('shop-content');
            const coinsDisplay = document.getElementById('shop-coins');

            // Update coins display
            coinsDisplay.textContent = this.state.getCoins();

            // Clear container
            container.innerHTML = '';

            // Get upgrades
            const upgrades = SHOP_CONFIG.upgrades;

            // Render upgrades
            upgrades.forEach(upgrade => {
                const el = document.createElement('div');
                el.className = 'shop-item upgrade-item';

                const currentLevel = this.state.data.inventory.upgrades[upgrade.id] || 0;
                const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
                const isMaxed = currentLevel >= upgrade.maxLevel;

                el.innerHTML = `
                    <div class="item-icon">${upgrade.icon}</div>
                    <div class="item-name">${upgrade.name}</div>
                    <div class="item-description">${upgrade.description}</div>
                    <div class="upgrade-level">
                        <div class="level-bar">
                            ${Array(upgrade.maxLevel).fill(0).map((_, i) =>
                    `<div class="level-dot ${i < currentLevel ? 'active' : ''}"></div>`
                ).join('')}
                        </div>
                        <div class="level-text">Nivel ${currentLevel}/${upgrade.maxLevel}</div>
                    </div>
                    ${!isMaxed ? `<div class="item-price">💰 ${cost}</div>` : ''}
                    <button class="btn-upgrade ${isMaxed ? 'maxed' : ''}" data-id="${upgrade.id}" data-cost="${cost}" ${isMaxed ? 'disabled' : ''}>
                        ${isMaxed ? '✓ MÁXIMO' : 'MEJORAR'}
                    </button>
                `;

                container.appendChild(el);
            });

            // Add event listeners
            container.querySelectorAll('.btn-upgrade').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const cost = parseInt(btn.dataset.cost);
                    const upgrade = SHOP_CONFIG.upgrades.find(u => u.id === id);

                    if (this.state.buyUpgrade(id, cost, upgrade.maxLevel)) {
                        this.renderShop();
                        this.updateMenu();
                        this.showNotification('⬆️ Mejorado!', `${upgrade.name} mejorado`);
                    } else {
                        this.showNotification('❌ Sin fondos', 'No tenés suficientes monedas');
                    }
                });
            });
        });
    }

    renderRanking() {
        const container = document.querySelector('.ranking-list');
        container.innerHTML = '';
        const runs = this.state.data.stats.runs;

        if (runs.length === 0) {
            container.innerHTML = '<p>Todavía no jugaste ninguna partida, amargo.</p>';
            return;
        }

        // Show total kills at the top
        const totalKills = this.state.data.stats.totalKills;
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom: 20px; padding: 10px; background: rgba(255,215,0,0.2); border: 2px solid var(--yellow);';
        header.innerHTML = `<h3 style="color: var(--yellow);">🐔 TOTAL GALLINAS MATADAS: ${totalKills}</h3>`;
        container.appendChild(header);

        const subtitle = document.createElement('h3');
        subtitle.textContent = 'MEJORES PARTIDAS';
        subtitle.style.cssText = 'color: var(--white); margin: 20px 0 10px 0;';
        container.appendChild(subtitle);

        runs.forEach((run, index) => {
            const el = document.createElement('div');
            el.style.cssText = 'padding: 10px; margin: 5px 0; background: rgba(0,20,137,0.3); border-left: 3px solid var(--yellow);';

            const minutes = Math.floor(run.time / 60);
            const seconds = run.time % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            el.innerHTML = `
                <strong style="color: var(--yellow);">#${index + 1}</strong> - 
                <span style="color: var(--white);">⭐ ${run.score} pts</span> | 
                <span style="color: var(--white);">🐔 ${run.kills} kills</span> | 
                <span style="color: var(--white);">⏱️ ${timeStr}</span>
                <br><small style="color: #aaa;">${new Date(run.date).toLocaleDateString()}</small>
            `;
            container.appendChild(el);
        });
    }

    renderAchievements() {
        import('./shop-config.js').then(module => {
            const { ACHIEVEMENT_INFO } = module;
            const container = document.getElementById('achievements-list');
            container.innerHTML = '';

            const unlocked = this.state.getUnlockedAchievements();
            const locked = this.state.getLockedAchievements();

            // Update summary
            document.getElementById('achievements-unlocked').textContent = unlocked.length;
            document.getElementById('achievements-total').textContent = Object.keys(this.state.data.achievements).length;

            // Render all achievements
            const allAchievements = [...unlocked, ...locked];

            allAchievements.forEach(achievement => {
                const info = ACHIEVEMENT_INFO[achievement.id];
                if (!info) return;

                const el = document.createElement('div');
                el.className = 'achievement-item';
                el.classList.add(achievement.unlocked ? 'unlocked' : 'locked');

                el.innerHTML = `
                    <div class="achievement-icon">${info.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${info.name}</div>
                        <div class="achievement-description">${info.description}</div>
                        <div class="achievement-reward">
                            ${achievement.unlocked ? '✓ Desbloqueado' : `🔒 Recompensa: ${achievement.reward} monedas`}
                        </div>
                    </div>
                `;

                container.appendChild(el);
            });
        });
    }

    showNotification(title, message, type = 'default') {
        const container = document.getElementById('notifications-container');

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon">${type === 'achievement' ? '🏆' : type === 'level-up' ? '⬆️' : '💬'}</div>
                <div class="notification-title">${title}</div>
            </div>
            <div class="notification-message">${message}</div>
        `;

        container.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
