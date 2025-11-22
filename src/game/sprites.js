export const drawSprite = (ctx, sprite, x, y, scale) => {
    const rows = sprite.length;
    const cols = sprite[0].length;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const colorCode = sprite[r][c];
            if (colorCode !== null) {
                ctx.fillStyle = colorCode;
                ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
            }
        }
    }
};

// Colors
const B = '#001489'; // Boca Blue
const Y = '#FFD700'; // Boca Yellow
const W = '#FFFFFF'; // White
const R = '#FF0000'; // Red
const O = '#FFA500'; // Orange
const K = '#000000'; // Black
const _ = null;      // Transparent

export const SPRITES = {
    PLAYER_SHIELD: [
        [_, _, _, _, _, _, _, Y, Y, _, _, _, _, _, _, _], // Tip
        [_, _, _, _, _, _, Y, B, B, Y, _, _, _, _, _, _],
        [_, _, _, _, _, Y, B, B, B, B, Y, _, _, _, _, _],
        [_, _, _, _, Y, B, B, B, B, B, B, Y, _, _, _, _],
        [Y, _, _, Y, B, B, B, B, B, B, B, B, Y, _, _, Y], // Wings start
        [Y, Y, _, Y, B, B, Y, Y, Y, Y, B, B, Y, _, Y, Y],
        [Y, B, Y, Y, B, B, Y, Y, Y, Y, B, B, Y, Y, B, Y], // Yellow Band
        [Y, B, B, Y, B, B, B, B, B, B, B, B, Y, B, B, Y],
        [Y, B, B, Y, B, B, B, B, B, B, B, B, Y, B, B, Y],
        [Y, B, B, Y, B, Y, B, Y, B, Y, B, B, Y, B, B, Y], // CABJ dots
        [Y, B, B, Y, B, B, B, B, B, B, B, B, Y, B, B, Y],
        [Y, B, B, Y, B, B, B, B, B, B, B, B, Y, B, B, Y],
        [_, Y, Y, _, Y, B, B, B, B, B, B, Y, _, Y, Y, _],
        [_, _, _, _, _, Y, B, B, B, B, Y, _, _, _, _, _],
        [_, _, _, _, _, _, Y, Y, Y, Y, _, _, _, _, _, _], // Bottom
        [_, _, _, _, _, O, O, _, _, O, O, _, _, _, _, _]  // Engine Thrusters
    ],
    ENEMY_CHICKEN: [
        [_, _, _, _, R, R, _, _, _, _], // Comb
        [_, _, _, W, W, W, W, _, _, _],
        [_, _, W, W, W, W, W, W, _, _],
        [_, W, W, K, W, W, K, W, W, _], // Eyes
        [_, W, W, W, O, O, W, W, W, _], // Beak
        [W, W, W, W, W, W, W, W, W, W],
        [W, W, R, R, R, R, R, R, W, W], // Red Sash
        [W, R, W, W, W, W, W, W, R, W],
        [W, W, W, W, W, W, W, W, W, W],
        [_, W, W, W, W, W, W, W, W, _],
        [_, _, O, _, _, _, _, O, _, _]  // Feet
    ]
};
