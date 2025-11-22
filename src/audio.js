export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playTone(frequency, type, duration) {
        if (!this.enabled) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playShoot() {
        this.playTone(440, 'square', 0.1); // Pew
    }

    playExplosion() {
        this.playTone(100, 'sawtooth', 0.3); // Boom
    }

    playCoin() {
        this.playTone(880, 'sine', 0.1); // Ding
        setTimeout(() => this.playTone(1760, 'sine', 0.1), 100);
    }

    playStart() {
        // Simple melody
        [440, 554, 659].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'square', 0.2), i * 200);
        });
    }
}
