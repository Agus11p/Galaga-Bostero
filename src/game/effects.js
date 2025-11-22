// Visual Effects System
export class VisualEffects {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.trails = [];
        this.screenShake = { active: false, intensity: 0, duration: 0 };
    }

    // Trail effect for player
    addTrail(x, y, width, height, color, type = 'none') {
        if (type === 'none') return;

        const trail = {
            x: x,
            y: y,
            width: width,
            height: height,
            color: color,
            alpha: 1,
            type: type,
            life: 20
        };

        this.trails.push(trail);
    }

    update(deltaTime) {
        // Update trails
        this.trails.forEach(trail => {
            trail.life -= deltaTime * 0.05;
            trail.alpha = trail.life / 20;
            trail.y += 2; // Drift down
        });

        this.trails = this.trails.filter(t => t.life > 0);

        // Update screen shake
        if (this.screenShake.active) {
            this.screenShake.duration -= deltaTime;
            if (this.screenShake.duration <= 0) {
                this.screenShake.active = false;
                this.screenShake.intensity = 0;
            }
        }
    }

    draw() {
        // Draw trails
        this.trails.forEach(trail => {
            this.ctx.save();
            this.ctx.globalAlpha = trail.alpha;

            switch (trail.type) {
                case 'blue':
                    this.ctx.fillStyle = '#001489';
                    break;
                case 'gold':
                    this.ctx.fillStyle = '#FFD700';
                    break;
                case 'rainbow':
                    const gradient = this.ctx.createLinearGradient(trail.x, trail.y, trail.x, trail.y + trail.height);
                    gradient.addColorStop(0, '#FF0000');
                    gradient.addColorStop(0.33, '#00FF00');
                    gradient.addColorStop(0.66, '#0000FF');
                    gradient.addColorStop(1, '#FFD700');
                    this.ctx.fillStyle = gradient;
                    break;
                case 'fire':
                    const fireGradient = this.ctx.createRadialGradient(
                        trail.x + trail.width / 2, trail.y + trail.height / 2, 0,
                        trail.x + trail.width / 2, trail.y + trail.height / 2, trail.width
                    );
                    fireGradient.addColorStop(0, '#FFD700');
                    fireGradient.addColorStop(0.5, '#FF6600');
                    fireGradient.addColorStop(1, '#FF0000');
                    this.ctx.fillStyle = fireGradient;
                    break;
                default:
                    this.ctx.fillStyle = trail.color;
            }

            this.ctx.fillRect(trail.x, trail.y, trail.width, trail.height);
            this.ctx.restore();
        });
    }

    shake(intensity = 5, duration = 200) {
        this.screenShake.active = true;
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }

    getShakeOffset() {
        if (!this.screenShake.active) return { x: 0, y: 0 };

        return {
            x: (Math.random() - 0.5) * this.screenShake.intensity,
            y: (Math.random() - 0.5) * this.screenShake.intensity
        };
    }
}

// Power-up class
export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type; // 'shield', 'rapidFire', 'multiShot', 'slowMo'
        this.markedForDeletion = false;
        this.speed = 2;
        this.rotation = 0;

        // Type-specific properties
        this.colors = {
            shield: '#00FFFF',
            rapidFire: '#FF6600',
            multiShot: '#FF00FF',
            slowMo: '#00FF00'
        };

        this.icons = {
            shield: '🛡️',
            rapidFire: '🔥',
            multiShot: '✨',
            slowMo: '⏱️'
        };
    }

    update(deltaTime) {
        this.y += this.speed;
        this.rotation += deltaTime * 0.005;

        // Remove if off screen
        if (this.y > window.innerHeight + 50) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.colors[this.type];

        // Draw circle
        ctx.fillStyle = this.colors[this.type];
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw icon
        ctx.shadowBlur = 0;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icons[this.type], 0, 0);

        ctx.restore();
    }
}

// Enhanced Particle System
export class EnhancedParticle {
    constructor(x, y, color, type = 'explosion') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.life = 1;
        this.maxLife = 1;
        this.markedForDeletion = false;

        if (type === 'explosion') {
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8;
            this.size = Math.random() * 4 + 2;
            this.decay = 0.02;
        } else if (type === 'spark') {
            this.vx = (Math.random() - 0.5) * 12;
            this.vy = Math.random() * -10 - 5;
            this.size = Math.random() * 3 + 1;
            this.decay = 0.03;
            this.gravity = 0.3;
        } else if (type === 'star') {
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
            this.size = Math.random() * 6 + 3;
            this.decay = 0.015;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        }
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'spark') {
            this.vy += this.gravity;
        }

        if (this.type === 'star') {
            this.rotation += this.rotationSpeed;
        }

        this.life -= this.decay;

        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;

        if (this.type === 'star') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;

            // Draw star shape
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5;
                const radius = i % 2 === 0 ? this.size : this.size / 2;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }

        ctx.restore();
    }
}
