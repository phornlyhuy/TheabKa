/**
 * Audio service for Khmer Wedding ambiance
 * Includes Web Audio API pentatonic traditional chime synthesizer + custom MP3 player
 */

class WeddingAudioManager {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private customAudio: HTMLAudioElement | null = null;
  private melodyTimer: any = null;
  private onStateChangeListeners: Array<(isPlaying: boolean) => void> = [];

  constructor() {
    // Initialized on user interaction
  }

  public subscribe(listener: (isPlaying: boolean) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach(listener => listener(this.isPlaying));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public toggle(customUrl?: string) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(customUrl);
    }
  }

  public play(customUrl?: string) {
    if (this.isPlaying) return;

    if (customUrl && customUrl.trim().length > 0) {
      try {
        if (!this.customAudio || this.customAudio.src !== customUrl) {
          this.customAudio = new Audio(customUrl);
          this.customAudio.loop = true;
        }
        this.customAudio.play().then(() => {
          this.isPlaying = true;
          this.notify();
        }).catch(() => {
          // If custom URL fails (e.g. CORS/404), fall back to graceful synth
          this.startSynthesizedMelody();
        });
        return;
      } catch (e) {
        this.startSynthesizedMelody();
        return;
      }
    }

    this.startSynthesizedMelody();
  }

  public stop() {
    this.isPlaying = false;
    if (this.customAudio) {
      try {
        this.customAudio.pause();
      } catch (_) {}
    }
    if (this.melodyTimer) {
      clearInterval(this.melodyTimer);
      this.melodyTimer = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.suspend();
      } catch (_) {}
    }
    this.notify();
  }

  /**
   * Synthesize romantic traditional Khmer chime & bell harmony (Pentatonic Scale)
   * Notes roughly corresponding to traditional Khmer Pinpeat/Mohori scale
   */
  private startSynthesizedMelody() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isPlaying = true;
      this.notify();

      // Pentatonic notes frequencies (Khmer traditional chime harmony)
      const khmerScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      const melodySequence = [0, 2, 4, 3, 2, 5, 4, 2, 1, 3, 2, 0, 4, 3, 5, 7, 5, 4, 2, 0];
      let step = 0;

      const playTone = () => {
        if (!this.isPlaying || !this.audioCtx) return;

        const noteIndex = melodySequence[step % melodySequence.length];
        const freq = khmerScale[noteIndex];
        step++;

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Warm sine + triangle blend
        osc.type = step % 3 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle, soft chime envelope (attack and gentle decay)
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 1.9);
      };

      playTone();
      this.melodyTimer = setInterval(playTone, 1400);
    } catch (e) {
      console.warn('Audio playback error', e);
      this.isPlaying = false;
      this.notify();
    }
  }
}

export const weddingAudio = new WeddingAudioManager();
