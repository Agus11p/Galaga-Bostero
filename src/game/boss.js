import { Enemy } from './enemy.js';

export class Boss extends Enemy {
    constructor(game, x, y) {
        super(game, x, y, 'boss');
        this.width = 100;
        this.height = 100;
        this.hp = 20;
        this.maxHp = 20;
        this.scoreValue = 1000;
        this.color = '#FFFFFF'; // White (Gallardo/River Plate)
        this.speedX = 2;
    }

    update(deltaTime) {
        // Boss movement: Bounce left/right
        this.x += this.speedX;
        if (this.x <= 0 || this.x + this.width >= this.game.canvas.width) {
            this.speedX *= -1;
        }
    }

    draw(ctx) {
        // Draw Boss (Giant Chicken/Doll)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Red sash (River style)
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + 20, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + 20);
        ctx.fill();

        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 20, this.width, 10);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 20, (this.hp / this.maxHp) * this.width, 10);
    }

    takeDamage() {
        this.hp--;
        if (this.hp <= 0) {
            this.markedForDeletion = true;
        }
    }
}
