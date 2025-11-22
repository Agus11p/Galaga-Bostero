import { GameState } from './src/state.js';
import { UIManager } from './src/ui.js';
import { GameEngine } from './src/game/engine.js';

console.log("Matagallinas en la Bombonera - Iniciando...");

// Initialize State
const state = new GameState();

// Initialize Game Engine
const game = new GameEngine(state);

// Initialize UI
const ui = new UIManager(state, game);

// Start Application
document.addEventListener('DOMContentLoaded', () => {
    ui.init();
});
