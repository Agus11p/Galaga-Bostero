// Reset Script - Run this once to clear all saved data
console.log('🔄 Reseteando datos del juego...');

// Clear all localStorage
localStorage.removeItem('galaga_bostero_data');
localStorage.removeItem('galaga_last_run');

console.log('✅ Datos borrados. Recarga la página para empezar de 0.');
console.log('💡 Ahora tenés que registrarte de nuevo.');

// Auto reload
setTimeout(() => {
    window.location.reload();
}, 1000);
