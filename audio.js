// Audio System - Tick-based music engine for games
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;

        this.enabled = true;

        // Music state
        this.bpm = 180;
        this.secondsPerBeat = 0.25;
        this.lookahead = 0.1;       // seconds
        this.scheduleInterval = 25; // ms
        this.nextNoteTime = 0;
        this.currentStep = 0;
        this.schedulerId = null;

        // Oscillators
        this.bassOsc = null;
        this.melOsc = null;

        // Songs can be ANY length
        this.bassNotes = [];
        this.melodyNotes = [];

        this.bassEnv = {
            attack: 0.005,
            decay: 0.08,
            sustain: 0.4,
            release: 0.05
        };

        this.melEnv = {
            attack: 0.03,
            decay: 0.15,
            sustain: 0.3,
            release: 0.18
        };
    }

    init() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);

        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = 0.15;
        this.musicGain.connect(this.masterGain);

        this.secondsPerBeat = 60 / this.bpm;
    }

    // ------------------------------------
    // NOTE SYSTEM
    // ------------------------------------
    noteToFrequency(note, octave = 4) {
        const table = {
            'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
            'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88,
        };
        if (!table[note]) return 0;
        return table[note] * Math.pow(2, octave - 4);
    }

    // ------------------------------------
    // MUSIC SETUP
    // ------------------------------------
    setSong({ bass, melody, bpm = 120 }) {
        this.bpm = bpm;
        this.secondsPerBeat = 60 / bpm;

        this.bassNotes = bass;
        this.melodyNotes = melody;

        this.currentStep = 0;
    }

    createOscillators() {
        // Bass
        this.bassOsc = this.audioContext.createOscillator();
        this.bassGain = this.audioContext.createGain();
        this.bassGain.gain.value = 0;

        this.bassOsc.type = 'triangle';
        this.bassOsc.connect(this.bassGain).connect(this.musicGain);
        this.bassOsc.start();

        // Melody
        this.melOsc = this.audioContext.createOscillator();
        this.melGain = this.audioContext.createGain();
        this.melGain.gain.value = 0;

        this.melOsc.type = 'sawtooth';
        this.melOsc.connect(this.melGain).connect(this.musicGain);
        this.melOsc.start();
    }

    applyEnvelope(gainNode, time, env) {
        const g = gainNode.gain;

        g.cancelScheduledValues(time);
        g.setValueAtTime(0, time);

        // Attack
        g.linearRampToValueAtTime(1, time + env.attack);

        // Decay → Sustain
        g.linearRampToValueAtTime(
            env.sustain,
            time + env.attack + env.decay
        );

        // Release (just before next beat)
        g.linearRampToValueAtTime(
            0,
            time + this.secondsPerBeat - env.release
        );
    }

    // ------------------------------------
    // SCHEDULER (GAME-FRIENDLY)
    // ------------------------------------
    scheduler() {
        const now = this.audioContext.currentTime;

        while (this.nextNoteTime < now + this.lookahead) {
            this.playStep(this.nextNoteTime);
            this.advanceStep();
        }
    }

    playStep(time) {
        const bassNote = this.bassNotes[this.currentStep % this.bassNotes.length];
        const melNote = this.melodyNotes[this.currentStep % this.melodyNotes.length];

        if (bassNote) {
            this.bassOsc.frequency.setValueAtTime(
                this.noteToFrequency(bassNote, 2),
                time
            );
            this.applyEnvelope(this.bassGain, time, this.bassEnv);
        }

        if (melNote) {
            this.melOsc.frequency.setValueAtTime(
                this.noteToFrequency(melNote, 5),
                time
            );
            this.applyEnvelope(this.melGain, time, this.melEnv);
        }
    }
    advanceStep() {
        this.nextNoteTime += this.secondsPerBeat;
        this.currentStep++;
    }

    // ------------------------------------
    // CONTROL
    // ------------------------------------
    startMusic() {
        if (!this.enabled || !this.audioContext) return;

        this.stopMusic();
        this.createOscillators();

        this.nextNoteTime = this.audioContext.currentTime;

        this.schedulerId = setInterval(
            () => this.scheduler(),
            this.scheduleInterval
        );
    }

    stopMusic() {
        if (this.schedulerId) {
            clearInterval(this.schedulerId);
            this.schedulerId = null;
        }

        if (this.bassOsc) this.bassOsc.stop();
        if (this.melOsc) this.melOsc.stop();

        this.bassOsc = null;
        this.melOsc = null;
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) this.stopMusic();
        return this.enabled;
    }

    playShoot() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // ----------------------------
        // MASTER ENVELOPE
        // ----------------------------
        const gain = ctx.createGain();
        gain.connect(this.masterGain);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1.0, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        // ----------------------------
        // NOISE "CRACK"
        // ----------------------------
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1800;
        noiseFilter.Q.value = 0.8;

        noise.connect(noiseFilter).connect(gain);
        noise.start(now);
        noise.stop(now + 0.12);

        // ----------------------------
        // LOW-END "THUMP"
        // ----------------------------
        const osc = ctx.createOscillator();
        osc.type = 'triangle';

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

        osc.connect(oscGain).connect(gain);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playEnemyHit() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playEnemyAlert() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.05);
        osc.frequency.setValueAtTime(400, now + 0.1);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playDoorOpen() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playPickup() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.05);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playPlayerHurt() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    }
}

// Create global instance
const audio = new AudioSystem();

audio.init();

audio.setSong({
    bpm: 300,

    // Strong harmonic foundation: tonic → dominant → relative minor → return
    bass: [
        'C', '.', '.', '.',
        'A', '.', 'E', '.',
        'F', '.', 'C', '.',
        'G', '.', 'C', '.',

        'C', '.', 'G', 'G',
        'A', '.', 'E', 'E',
        'F', 'F', 'G', 'G',
        'C', 'C', 'C', 'C'
    ],

    // Singing, classical melody with motivic development
    melody: [
        'E', 'G', 'A', '.',
        '.', 'D', 'C', 'D',

        'E', 'G', 'A', '.',
        '.', 'A', 'G', 'E',

        'F', '.', 'C', 'A',
        'G', 'E', '.', 'C',

        'G', '.', 'G', 'E',
        'D', 'C', '.', 'C',

        // Answer phrase (variation)
        'E', 'G', 'A', 'G',
        '.', '.', '.', '.',

        '.', '.', 'C', 'B',
        'A', 'G', 'E', 'D',

        '.', '.', 'C', 'A',
        'G', 'E', 'D', 'C',

        // Cadential close
        'G', '.', 'G', '.',
        'D', 'C', '.', '.'
    ]
});

audio.startMusic();
