/**
 * Web Audio API ambient atmospheric sound synthesizer.
 * Synthesizes subtle, non-intrusive crystalline glass resonance and quantum chimes.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastHoverTime: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Delicate glass resonance ping on element hover
   */
  public playHover(atomicNumber: number) {
    if (this.isMuted) return;

    // Rate limit hover sounds so fast mouse sweeps don't create audio clutter
    const now = performance.now();
    if (now - this.lastHoverTime < 60) return;
    this.lastHoverTime = now;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pentatonic pitch mapped to element number for subtle harmonic variety
      const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      const freq = pentatonic[atomicNumber % pentatonic.length] * 1.5;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Very soft gain: whisper-quiet 0.02
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback safety
    }
  }

  /**
   * Resonant crystalline celestial chord when selecting an element
   */
  public playSelect(atomicNumber: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const baseFreq = 220 + (atomicNumber % 36) * 12;
      const t = ctx.currentTime;

      [baseFreq, baseFreq * 1.5, baseFreq * 2].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const volume = 0.035 / (i + 1);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch {
      // Audio fallback safety
    }
  }

  /**
   * Ambient swoosh tone on mode switch
   */
  public playModeSwitch() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(560, t + 0.2);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.03, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.28);
    } catch {
      // Audio fallback safety
    }
  }

  /**
   * Harmonious chime when scrubbing past historic discoveries
   */
  public playDiscoveryChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      [587.33, 880, 1174.66].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.04);

        gain.gain.setValueAtTime(0.0001, t + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.025, t + i * 0.04 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.04 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + i * 0.04);
        osc.stop(t + i * 0.04 + 0.35);
      });
    } catch {
      // Audio fallback safety
    }
  }
}

export const soundEngine = new SoundEngine();
