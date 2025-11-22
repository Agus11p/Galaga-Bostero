export class Bullet {
    constructor(x, y, speed, isPlayerBullet = true, damage = 1) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.isPlayerBullet = isPlayerBullet;
        this.damage = damage;
        this.markedForDeletion = false;
    }

    update() {
        // Player bullets go up, enemy bullets go down
        if (this.isPlayerBullet) {
            this.y -= this.speed;
        } else {
            this.y += this.speed;
        }

        // Remove if off screen
        if (this.y < -50 || this.y > window.innerHeight + 50) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        if (this.isPlayerBullet) {
            // Player bullet - yellow with glow
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FFD700';
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
            ctx.restore();
        } else {
            // Enemy bullet - red
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        }
    }
}
