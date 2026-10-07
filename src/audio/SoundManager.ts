/**
 * Bounce Tales 3D Audio Engine
 * Pure Web Audio API procedural sound effects & adaptive world music synthesizer
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicOscillators: (OscillatorNode | GainNode)[] = [];
  private isMusicPlaying = false;
  private currentWorldTheme: string = '';
  private musicTimer: number | null = null;

  public masterVolume = 0.8;
  public sfxVolume = 0.8;
  public musicVolume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, music: number, sfx: number) {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
  }

  // --- SOUND EFFECTS ---

  public playJump() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playBounce(isSpring = false) {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isSpring ? 'triangle' : 'sine';
    const startFreq = isSpring ? 240 : 150;
    const endFreq = isSpring ? 720 : 360;
    const duration = isSpring ? 0.35 : 0.2;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.7);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.2, now + duration);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playLand() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playRingCollect() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    // Classic 2-tone ring ding: B5 -> E6
    [987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.28 * this.sfxVolume * this.masterVolume, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.25);
    });
  }

  public playStarCollect() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    // 4-note ascending sparkle arpeggio: C6, E6, G6, C7
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }

  public playCheckpoint() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    // Fanfare chords
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume * this.masterVolume, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  }

  public playSwitch() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.setValueAtTime(720, now + 0.05);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playHurt() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playBoost() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);

    gain.gain.setValueAtTime(0.22 * this.sfxVolume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playLevelClear() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    // Classic victory fanfare: C4, G4, C5, E5, G5, C6
    const chord = [261.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      const startTime = now + idx * 0.1;
      const dur = idx === chord.length - 1 ? 0.8 : 0.2;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  // --- BACKGROUND MUSIC SYNTHESIZER ---

  public startWorldMusic(theme: string) {
    if (this.currentWorldTheme === theme && this.isMusicPlaying) return;
    this.stopMusic();
    this.currentWorldTheme = theme;
    this.isMusicPlaying = true;
    this.initContext();

    this.playThemeLoop(theme);
  }

  private playThemeLoop(theme: string) {
    if (!this.isMusicPlaying || !this.ctx) return;

    // Define world melody scales and tempo
    let bpm = 120;
    let baseNotes = [261.63, 329.63, 392.0, 523.25]; // C major
    let bassNotes = [130.81, 164.81, 196.0, 130.81];

    if (theme === 'desert') {
      bpm = 110;
      baseNotes = [293.66, 311.13, 369.99, 440.0, 466.16]; // D Phrygian dominant
      bassNotes = [146.83, 146.83, 174.61, 146.83];
    } else if (theme === 'forest') {
      bpm = 100;
      baseNotes = [329.63, 392.0, 440.0, 493.88, 587.33]; // E minor pentatonic
      bassNotes = [164.81, 196.0, 220.0, 164.81];
    } else if (theme === 'snow') {
      bpm = 115;
      baseNotes = [523.25, 587.33, 659.25, 783.99, 880.0]; // Bright high pentatonic
      bassNotes = [130.81, 174.61, 196.0, 261.63];
    } else if (theme === 'cave') {
      bpm = 90;
      baseNotes = [220.0, 246.94, 261.63, 293.66, 329.63]; // A minor moody
      bassNotes = [110.0, 110.0, 130.81, 98.0];
    } else if (theme === 'machinery') {
      bpm = 135;
      baseNotes = [261.63, 277.18, 329.63, 392.0, 415.3]; // Industrial chromatic
      bassNotes = [130.81, 138.59, 164.81, 130.81];
    } else if (theme === 'volcano') {
      bpm = 140;
      baseNotes = [246.94, 261.63, 311.13, 369.99, 493.88]; // Locrian tense
      bassNotes = [123.47, 130.81, 155.56, 123.47];
    } else if (theme === 'apex') {
      bpm = 130;
      baseNotes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // Heroic epic
      bassNotes = [130.81, 164.81, 196.0, 261.63];
    }

    const stepDuration = 60 / bpm / 2; // 8th note duration
    const totalSteps = 16;
    const now = this.ctx.currentTime;

    if (this.musicVolume > 0 && this.masterVolume > 0) {
      for (let step = 0; step < totalSteps; step++) {
        const stepTime = now + step * stepDuration;

        // Bassline on downbeats
        if (step % 4 === 0) {
          const bassFreq = bassNotes[(step / 4) % bassNotes.length];
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();

          bassOsc.type = theme === 'machinery' ? 'sawtooth' : 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, stepTime);

          const bassVol = 0.12 * this.musicVolume * this.masterVolume;
          bassGain.gain.setValueAtTime(bassVol, stepTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, stepTime + stepDuration * 2);

          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          bassOsc.start(stepTime);
          bassOsc.stop(stepTime + stepDuration * 2);
        }

        // Arpeggiated melody note
        if (step % 2 === 0 || (step % 3 === 0 && theme !== 'cave')) {
          const noteIndex = (step * 3 + Math.floor(step / 4)) % baseNotes.length;
          const noteFreq = baseNotes[noteIndex];

          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();

          leadOsc.type = theme === 'snow' ? 'sine' : theme === 'machinery' ? 'square' : 'triangle';
          leadOsc.frequency.setValueAtTime(noteFreq, stepTime);

          const noteVol = 0.08 * this.musicVolume * this.masterVolume;
          leadGain.gain.setValueAtTime(noteVol, stepTime);
          leadGain.gain.exponentialRampToValueAtTime(0.001, stepTime + stepDuration * 1.5);

          leadOsc.connect(leadGain);
          leadGain.connect(this.ctx.destination);
          leadOsc.start(stepTime);
          leadOsc.stop(stepTime + stepDuration * 1.5);
        }
      }
    }

    const loopTimeMs = totalSteps * stepDuration * 1000 - 50;
    this.musicTimer = window.setTimeout(() => {
      if (this.isMusicPlaying) {
        this.playThemeLoop(theme);
      }
    }, loopTimeMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    this.currentWorldTheme = '';
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const soundManager = new SoundManager();
