/**
 * Audio Engine for F1 Racing Game
 * Uses Web Audio API to generate sounds programmatically
 * Lightweight approach - no external audio files needed
 */

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  /**
   * Initialize audio context
   * Must be called after user interaction (touch/click)
   */
  init() {
    if (this.isInitialized) return;

    try {
      // @ts-ignore - AudioContext is supported in modern browsers
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Play beep sound for countdown lights
   * Creates a clean 800Hz sine wave tone
   */
  playBeep() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure beep sound
      oscillator.frequency.value = 800; // 800Hz tone
      oscillator.type = 'sine';

      // Envelope: quick attack, short sustain, quick release
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.15); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + 0.2);    // Release

      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (error) {
      console.warn('Error playing beep:', error);
    }
  }

  /**
   * Play engine start sound (lights out)
   * Creates a more complex engine-rev-like sound using multiple oscillators
   */
  playEngineStart() {
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;

      // Create main engine rumble (low frequency)
      const rumble = this.audioContext.createOscillator();
      const rumbleGain = this.audioContext.createGain();

      rumble.connect(rumbleGain);
      rumbleGain.connect(this.audioContext.destination);

      rumble.type = 'sawtooth';
      rumble.frequency.setValueAtTime(100, now);
      rumble.frequency.exponentialRampToValueAtTime(200, now + 0.5);

      rumbleGain.gain.setValueAtTime(0, now);
      rumbleGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
      rumbleGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
      rumbleGain.gain.linearRampToValueAtTime(0, now + 1);

      // Create high-frequency whine (engine rev)
      const whine = this.audioContext.createOscillator();
      const whineGain = this.audioContext.createGain();

      whine.connect(whineGain);
      whineGain.connect(this.audioContext.destination);

      whine.type = 'square';
      whine.frequency.setValueAtTime(200, now);
      whine.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      whine.frequency.exponentialRampToValueAtTime(400, now + 1);

      whineGain.gain.setValueAtTime(0, now);
      whineGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      whineGain.gain.linearRampToValueAtTime(0.1, now + 0.5);
      whineGain.gain.linearRampToValueAtTime(0, now + 1);

      rumble.start(now);
      rumble.stop(now + 1);
      whine.start(now);
      whine.stop(now + 1);
    } catch (error) {
      console.warn('Error playing engine sound:', error);
    }
  }

  /**
   * Trigger vibration on mobile devices
   * @param duration Duration in milliseconds
   */
  vibrate(duration: number = 50) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (error) {
        console.warn('Vibration not supported:', error);
      }
    }
  }

  /**
   * Stop all sounds and clean up
   */
  cleanup() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const audioEngine = new AudioEngine();
