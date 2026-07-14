export class AudioManager {
  private context: AudioContext | null = null;

  playTone(frequency: number, duration = 0.06, volume = 0.035): void {
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") void this.context.resume();
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.context.currentTime + duration,
    );
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }

  destroy(): void {
    void this.context?.close();
    this.context = null;
  }
}
