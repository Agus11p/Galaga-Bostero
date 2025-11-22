import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js';
import { Boss } from './boss.js';
import { AudioManager } from '../audio.js';
import { VisualEffects, PowerUp, EnhancedParticle } from './effects.js';

export class GameEngine {
    constructor(state) {
        this.state = state;
        this.audio = new AudioManager();
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;

        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        this.stars = []; // Background stars

        // Visual effects system
        this.visualEffects = new VisualEffects(this.ctx, this.canvas);

        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.startTime = 0;

        this.killStreak = 0;
        this.powerUpActive = false;
        this.powerUpType = null;
        this.powerUpTimer = 0;

        this.lastTime = 0;
        this.enemyDirection = 1; // 1 = right, -1 = left
        this.enemyMoveTimer = 0;
        this.enemyMoveInterval = 1000; // Move every 1s

        // Power-up spawn timer
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 15000; // Every 15 seconds
    }

    start() {
        console.log("Game Started");
        this.resize();
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;

        // Apply shield upgrade for extra lives
        const shieldLevel = this.state.data.inventory.upgrades.shield || 0;
        this.lives = 3 + shieldLevel; // Base 3 lives + shield upgrades

        this.wave = 1;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        this.initStars();

        this.player = new Player(this);
        this.spawnWave();
        this.audio.playStart();

        this.startTime = Date.now();
        this.lastTime = 0;
        requestAnimationFrame((ts) => this.loop(ts));

        this.updateHUD();

        // Handle tab visibility to prevent ghost pause
        this.handleVisibilityChange = () => {
            if (document.hidden && this.isRunning && !this.isPaused) {
                // Tab hidden, pause the game properly
                this.isPaused = true;
                window.dispatchEvent(new CustomEvent('gamepause'));
            }
        };
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 0.5,
                color: Math.random() > 0.5 ? '#001489' : '#FFD700' // Blue or Yellow
            });
        }
    }

    createExplosion(x, y, color) {
        // Screen shake on explosion
        this.visualEffects.shake(3, 150);

        // Limit total particles to avoid performance spikes
        const MAX_PARTICLES = 300;
        if (this.particles.length >= MAX_PARTICLES) {
            // Too many particles, skip adding more for this explosion
            return;
        }
        const particlesToAdd = Math.min(30, MAX_PARTICLES - this.particles.length);
        // Distribute between explosion particles and sparks proportionally
        const explosionCount = Math.floor(particlesToAdd * 0.66); // ~20 of 30
        const sparkCount = particlesToAdd - explosionCount;
        for (let i = 0; i < explosionCount; i++) {
            this.particles.push(new EnhancedParticle(x, y, color, 'explosion'));
        }
        for (let i = 0; i < sparkCount; i++) {
            this.particles.push(new EnhancedParticle(x, y, '#FFD700', 'spark'));
        }
    }

    spawnPowerUp() {
        const types = ['shield', 'rapidFire', 'multiShot', 'slowMo'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (this.canvas.width - 60) + 30;
        const y = -30;

        this.powerUps.push(new PowerUp(x, y, type));
    }

    stop() {
        this.isRunning = false;
        if (this.handleVisibilityChange) {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTime = performance.now();
            requestAnimationFrame((ts) => this.loop(ts));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.player) {
            this.player.y = this.canvas.height - 100;
        }
    }

    spawnWave() {
        this.enemies = [];
        const rows = 4;
        const cols = 8;
        const startX = 50;
        const startY = 50;
        const padding = 60;

        // Increase difficulty: Faster movement
        this.enemyMoveInterval = Math.max(200, 1000 - (this.wave * 100));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let type = 'green';
                if (r === 0) type = 'gold';
                else if (r === 1) type = 'red';
                else if (r === 2) type = 'blue';

                this.enemies.push(new Enemy(this, startX + c * padding, startY + r * padding, type));
            }
        }
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        if (this.isPaused) return; // Stop loop if paused

        if (!this.lastTime) this.lastTime = timestamp;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Prevent huge jumps (e.g. tab switch or first frame)
        if (deltaTime > 100) {
            requestAnimationFrame((ts) => this.loop(ts));
            return;
        }

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(deltaTime) {
        if (!this.player) return;

        // Power-up Timer
        if (this.powerUpActive) {
            this.powerUpTimer -= deltaTime;

            // Update HUD
            this.updatePowerUpHUD();

            if (this.powerUpTimer <= 0) {
                this.powerUpActive = false;
                this.powerUpType = null;
                this.player.resetPowerUp();
                this.hidePowerUpHUD();
                console.log("Power-up expired");
            }
        }

        // Update Stars
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });

        // Update Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        // Update Visual Effects
        this.visualEffects.update(deltaTime);

        // Add trail for player
        const equippedTrail = this.state.data.inventory.equippedTrail;
        if (equippedTrail !== 'none') {
            this.visualEffects.addTrail(
                this.player.x,
                this.player.y + this.player.height,
                this.player.width,
                10,
                '#FFD700',
                equippedTrail
            );
        }

        // Power-up spawning
        this.powerUpSpawnTimer += deltaTime;
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }

        // Update Power-ups
        this.powerUps.forEach(powerUp => powerUp.update(deltaTime));
        this.powerUps = this.powerUps.filter(p => !p.markedForDeletion);

        // Power-up collision with player
        this.powerUps.forEach(powerUp => {
            if (this.checkRectCollision(powerUp, this.player)) {
                powerUp.markedForDeletion = true;
                this.activatePowerUp(powerUp.type);
                this.audio.playTone(800, 'sine', 0.2);
            }
        });

        this.player.update(deltaTime);

        // Update Bullets
        this.bullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(bullet => !bullet.markedForDeletion);

        // Update Enemies
        // Simple grid movement
        this.enemyMoveTimer += deltaTime;
        if (this.enemyMoveTimer > this.enemyMoveInterval) {
            this.enemyMoveTimer = 0;

            let hitEdge = false;
            this.enemies.forEach(enemy => {
                if ((enemy.x + enemy.width >= this.canvas.width - 20 && this.enemyDirection === 1) ||
                    (enemy.x <= 20 && this.enemyDirection === -1)) {
                    hitEdge = true;
                }
            });

            if (hitEdge) {
                this.enemyDirection *= -1;
                this.enemies.forEach(enemy => enemy.y += 20); // Move down
            } else {
                this.enemies.forEach(enemy => enemy.x += 20 * this.enemyDirection);
            }
        }

        // Enemy Shooting (Difficulty increases over TIME, not just wave)
        if (this.enemies.length > 0) {
            const elapsedMinutes = (Date.now() - this.startTime) / 60000; // Minutes elapsed

            // Base chance increases every minute
            // Start: 0.5% per frame, After 1min: 1%, After 2min: 1.5%, etc.
            const baseChance = 0.005 + (elapsedMinutes * 0.005);

            // Wave multiplier (each wave makes it slightly harder too)
            const waveMultiplier = 1 + (this.wave * 0.1);

            const shootChance = baseChance * waveMultiplier;

            // Shoot multiple bullets as time goes on
            const shotsPerFrame = Math.min(3, Math.floor(elapsedMinutes / 2) + 1); // 1 shot initially, up to 3 after 4 minutes

            for (let i = 0; i < shotsPerFrame; i++) {
                if (Math.random() < shootChance && this.enemies.length > 0) {
                    const shooter = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                    // Create enemy bullet (isPlayerBullet = false)
                    const bullet = new Bullet(shooter.x + shooter.width / 2, shooter.y + shooter.height, 5, false);
                    this.bullets.push(bullet);
                }
            }
        }

        // Collision Detection
        this.checkCollisions();

        // Wave clear
        if (this.enemies.length === 0) {
            this.wave++;
            this.spawnWave();
            this.updateHUD();
        }
    }

    checkCollisions() {
        this.bullets.forEach(bullet => {
            if (bullet.isPlayerBullet) {
                this.enemies.forEach(enemy => {
                    if (!enemy.markedForDeletion && !bullet.markedForDeletion) {
                        if (this.checkRectCollision(bullet, enemy)) {
                            bullet.markedForDeletion = true;

                            if (enemy instanceof Boss) {
                                enemy.takeDamage();
                                if (enemy.markedForDeletion) {
                                    this.score += enemy.scoreValue;
                                    this.state.addKill();
                                    this.killStreak++; // Streak
                                    this.checkPowerUp();
                                    this.audio.playExplosion();
                                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#FFFFFF');
                                    this.updateHUD();
                                } else {
                                    this.audio.playTone(200, 'square', 0.05); // Hit sound
                                }
                            } else {
                                enemy.markedForDeletion = true;
                                this.score += enemy.scoreValue;
                                this.state.addKill();
                                this.killStreak++; // Streak
                                this.checkPowerUp();
                                this.audio.playExplosion();
                                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                                this.updateHUD();
                            }
                        }
                    }
                });
            } else {
                // Enemy bullet hitting player
                if (!bullet.markedForDeletion && this.checkRectCollision(bullet, this.player)) {
                    bullet.markedForDeletion = true;
                    this.handlePlayerHit();
                }
            }
        });

        // Enemy vs Player Collision
        this.enemies.forEach(enemy => {
            if (!enemy.markedForDeletion && this.checkRectCollision(enemy, this.player)) {
                enemy.markedForDeletion = true;
                this.handlePlayerHit();
            }
        });

        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    }

    checkPowerUp() {
        if (this.killStreak > 0 && this.killStreak % 10 === 0) {
            this.activatePowerUp('rapidFire');
        }
    }

    activatePowerUp(type) {
        this.powerUpActive = true;
        this.powerUpType = type;
        this.powerUpTimer = 5000; // 5 seconds
        this.player.applyPowerUp(type);

        // Visual effects
        for (let i = 0; i < 30; i++) {
            this.particles.push(new EnhancedParticle(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                '#00FF00',
                'star'
            ));
        }

        // Notify UI
        const powerUpNames = {
            shield: '🛡️ Escudo Activado',
            rapidFire: '🔥 Fuego Rápido',
            multiShot: '✨ Disparo Triple',
            slowMo: '⏱️ Cámara Lenta'
        };

        window.dispatchEvent(new CustomEvent('powerup', {
            detail: { type: type, name: powerUpNames[type] }
        }));

        // Show HUD
        this.showPowerUpHUD();

        console.log("Power-up Activated: " + type);
    }

    handlePlayerHit() {
        this.lives--;
        this.killStreak = 0; // Reset streak
        this.audio.playExplosion();
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#FFD700');
        this.updateHUD();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Respawn/Reset player position or invulnerability
            // For now just shake effect or similar (TODO)
        }
    }

    checkRectCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y
        );
    }

    draw() {
        // Apply screen shake
        const shakeOffset = this.visualEffects.getShakeOffset();
        this.ctx.save();
        this.ctx.translate(shakeOffset.x, shakeOffset.y);

        this.ctx.clearRect(-shakeOffset.x, -shakeOffset.y, this.canvas.width, this.canvas.height);

        // Draw Stars
        this.stars.forEach(star => {
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        });

        // Draw Visual Effects (trails)
        this.visualEffects.draw();

        // Draw Player
        if (this.player) this.player.draw(this.ctx);

        // Draw Enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw Bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw Power-ups
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fillRect(p.x, p.y, 4, 4);
            this.ctx.globalAlpha = 1.0;
        });

        this.ctx.restore();
    }

    updateHUD() {
        document.getElementById('game-score').textContent = this.score;
        document.getElementById('game-lives').textContent = this.lives;
        document.getElementById('game-wave').textContent = this.wave;
    }

    updatePowerUpHUD() {
        const hud = document.getElementById('powerup-hud');
        const timer = document.getElementById('powerup-timer');
        const icon = document.getElementById('powerup-icon');
        const name = document.getElementById('powerup-name');

        if (hud && timer) {
            const seconds = (this.powerUpTimer / 1000).toFixed(1);
            timer.textContent = `${seconds}s`;

            // Update icon and name based on type
            const powerUpData = {
                shield: { icon: '🛡️', name: 'ESCUDO' },
                rapidFire: { icon: '🔥', name: 'FUEGO RÁPIDO' },
                multiShot: { icon: '✨', name: 'TRIPLE DISPARO' },
                slowMo: { icon: '⏱️', name: 'SLOW MOTION' }
            };

            if (this.powerUpType && powerUpData[this.powerUpType]) {
                icon.textContent = powerUpData[this.powerUpType].icon;
                name.textContent = powerUpData[this.powerUpType].name;
            }
        }
    }

    showPowerUpHUD() {
        const hud = document.getElementById('powerup-hud');
        if (hud) {
            hud.classList.remove('hidden');
        }
    }

    hidePowerUpHUD() {
        const hud = document.getElementById('powerup-hud');
        if (hud) {
            hud.classList.add('hidden');
        }
    }

    endGame() {
        this.gameOver();
    }

    gameOver() {
        this.stop();

        const endTime = Date.now();
        const durationSeconds = Math.floor((endTime - this.startTime) / 1000);
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Simple scoring: 1 kill = 1 point
        const totalScore = this.score;
        const coins = Math.floor(totalScore / 2); // 1 coin every 2 kills

        // Save run data for Game Over screen
        const runData = {
            kills: this.score,
            score: totalScore,
            time: durationSeconds,
            timeString: timeString,
            bonus: 0, // No bonus for now
            coins: coins,
            wave: this.wave,
            date: new Date().toISOString()
        };
        localStorage.setItem('galaga_last_run', JSON.stringify(runData));

        // Update state
        this.state.addCoins(coins);
        this.state.addRun({
            score: totalScore,
            kills: this.score,
            time: durationSeconds,
            wave: this.wave,
            date: runData.date
        });
        this.state.save();

        // Dispatch gameover event for UI to handle
        console.log('Game Over - Dispatching event');
        window.dispatchEvent(new CustomEvent('gameover'));
    }
}
