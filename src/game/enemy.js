import { drawSprite, SPRITES } from './sprites.js';

export class Enemy {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.scale = 3;
        this.width = 10 * this.scale; // Sprite width is 10
        this.height = 11 * this.scale; // Sprite height is 11
        this.type = type; // 'green', 'blue', 'red', 'gold'
        this.markedForDeletion = false;

        // All enemies worth 1 point (simplified scoring)
        this.scoreValue = 1;

        // Color based on type
        switch (type) {
            case 'green': this.color = '#00FF00'; break;
            case 'blue': this.color = '#0000FF'; break;
            case 'red': this.color = '#FF0000'; break;
            case 'gold': this.color = '#FFD700'; break;
            default: this.color = '#FFFFFF';
        }
    }

    update(deltaTime) {
        // Basic movement (Galaga style - swarm later, for now just static or simple drift)
        // this.y += 0.5; // Slowly move down
    }

    draw(ctx) {
        drawSprite(ctx, SPRITES.ENEMY_CHICKEN, this.x, this.y, this.scale);
    }
}
