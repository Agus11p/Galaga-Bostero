import { Bullet } from './bullet.js';
import { drawSprite, SPRITES } from './sprites.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.scale = 3;
        this.width = 16 * this.scale;
        this.height = 16 * this.scale;
        this.x = game.canvas.width / 2 - this.width / 2;
        this.y = game.canvas.height - 100;

        // Base Stats
        this.baseSpeed = 5;
        this.baseFireRate = 500;
        this.baseDamage = 1;

        // Apply Upgrades from state
        const upgrades = this.game.state.data.inventory.upgrades || {};
        this.speedLevel = upgrades.speed || 0;
        this.fireRateLevel = upgrades.fireRate || 0;
        this.shieldLevel = upgrades.shield || 0;
        this.damageLevel = upgrades.damage || 0;

        // Calculate stats with upgrades
        this.speed = this.baseSpeed * (1 + (this.speedLevel * 0.2)); // +20% per level
        this.fireRate = Math.max(100, this.baseFireRate - (this.fireRateLevel * 100)); // -100ms per level
        this.damage = this.baseDamage * (1 + (this.damageLevel * 0.5)); // +50% per level

        // Get equipped skin
        this.equippedSkin = this.game.state.data.inventory.equippedSkin || 'default';

        // Skin colors
        this.skinColors = {
            default: '#001489',
            merentiel: '#FF6600',
            paredes: '#00FF00',
            cavani: '#FFD700',
            advincula: '#FF00FF',
            rojo: '#FF0000'
        };

        this.color = this.skinColors[this.equippedSkin] || '#001489';
        this.bullets = [];
        this.lastShotTime = 0;

        // Power-up states
        this.hasShield = false;
        this.rapidFire = false;
        this.multiShot = false;

        // Controls
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            ArrowLeft_KB: false,
            ArrowRight_KB: false,
            Space_KB: false
        };

        window.addEventListener('keydown', e => {
            if (e.code === 'ArrowLeft') { this.keys.ArrowLeft = true; this.keys.ArrowLeft_KB = true; }
            if (e.code === 'ArrowRight') { this.keys.ArrowRight = true; this.keys.ArrowRight_KB = true; }
            if (e.code === 'Space') { this.keys.Space = true; this.keys.Space_KB = true; }
        });

        window.addEventListener('keyup', e => {
            if (e.code === 'ArrowLeft') {
                this.keys.ArrowLeft_KB = false;
                const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
                const gp = gamepads[0];
                if (!gp || gp.axes[0] >= -0.5) {
                    this.keys.ArrowLeft = false;
                }
            }
            if (e.code === 'ArrowRight') {
                this.keys.ArrowRight_KB = false;
                const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
                const gp = gamepads[0];
                if (!gp || gp.axes[0] <= 0.5) {
                    this.keys.ArrowRight = false;
                }
            }
            if (e.code === 'Space') {
                this.keys.Space_KB = false;
                const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
                const gp = gamepads[0];
                if (!gp || (!gp.buttons[2].pressed && !gp.buttons[7].pressed)) {
                    this.keys.Space = false;
                }
            }
        });
    }

    update(deltaTime) {
        this.updateInput();

        // Movement
        if (this.keys.ArrowLeft) this.x -= this.speed;
        if (this.keys.ArrowRight) this.x += this.speed;

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.canvas.width - this.width) this.x = this.game.canvas.width - this.width;

        // Shooting
        if (this.keys.Space) {
            this.shoot();
        }
    }

    updateInput() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0];

        if (gp) {
            const axisH = gp.axes[0];
            if (axisH < -0.5) this.keys.ArrowLeft = true;
            else if (axisH > 0.5) this.keys.ArrowRight = true;
            else {
                if (!this.keys.ArrowLeft_KB) this.keys.ArrowLeft = false;
                if (!this.keys.ArrowRight_KB) this.keys.ArrowRight = false;
            }

            if (gp.buttons[2].pressed || gp.buttons[7].pressed) {
                this.keys.Space = true;
                if (gp.vibrationActuator && !this.isRumbling) {
                    this.isRumbling = true;
                    gp.vibrationActuator.playEffect("dual-rumble", {
                        startDelay: 0,
                        duration: 100,
                        weakMagnitude: 0.5,
                        strongMagnitude: 0.5
                    }).then(() => this.isRumbling = false);
                }
            } else {
                if (!this.keys.Space_KB) this.keys.Space = false;
            }
        }
    }

    shoot() {
        const now = Date.now();
        const currentFireRate = this.rapidFire ? this.fireRate / 2 : this.fireRate;

        if (now - this.lastShotTime > currentFireRate) {
            if (this.multiShot) {
                // Triple shot
                this.game.bullets.push(new Bullet(this.x + this.width / 2 - 10, this.y, 10, true, this.damage));
                this.game.bullets.push(new Bullet(this.x + this.width / 2, this.y, 10, true, this.damage));
                this.game.bullets.push(new Bullet(this.x + this.width / 2 + 10, this.y, 10, true, this.damage));
            } else {
                // Single shot
                this.game.bullets.push(new Bullet(this.x + this.width / 2, this.y, 10, true, this.damage));
            }

            this.lastShotTime = now;
            if (this.game.audio) this.game.audio.playShoot();
        }
    }

    applyPowerUp(type) {
        switch (type) {
            case 'shield':
                this.hasShield = true;
                break;
            case 'rapidFire':
                this.rapidFire = true;
                break;
            case 'multiShot':
                this.multiShot = true;
                break;
            case 'slowMo':
                // Handled by game engine
                break;
        }
    }

    resetPowerUp() {
        this.hasShield = false;
        this.rapidFire = false;
        this.multiShot = false;
    }

    draw(ctx) {
        // Draw shield if active
        if (this.hasShield) {
            ctx.save();
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00FFFF';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Draw player ship with sprite
        drawSprite(ctx, SPRITES.PLAYER_SHIELD, this.x, this.y, this.scale);

        // Add color tint based on equipped skin
        if (this.equippedSkin !== 'default') {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    }
}
