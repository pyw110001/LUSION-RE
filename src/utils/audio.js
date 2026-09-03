export class AudioManager {
  constructor() {
    this.soundBtn = document.getElementById('header-right-sound-btn');
    this.canvas = document.getElementById('sound-canvas');
    this.isEnabled = false;
    this.audioCtx = null;
    this.oscillator = null;

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.initVisualizer();
    }

    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', this.toggleSound.bind(this));
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playChime(freq = 440, type = 'sine') {
    if (!this.isEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContext policy
    }
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    this.initAudio();

    if (this.isEnabled) {
      this.playChime(587.33, 'triangle'); // D5 chime
      setTimeout(() => this.playChime(880, 'sine'), 100); // A5 chime
    }
  }

  initVisualizer() {
    const bars = 4;
    const barWidth = 3;
    const gap = 3;
    let t = 0;

    const render = () => {
      requestAnimationFrame(render);
      t += 0.08;

      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);

      const totalWidth = bars * barWidth + (bars - 1) * gap;
      const startX = (w - totalWidth) / 2;

      for (let i = 0; i < bars; i++) {
        let barHeight;
        if (this.isEnabled) {
          // Dynamic dancing bars when sound is ON
          barHeight = 4 + (Math.sin(t * 2 + i * 1.5) * 0.5 + 0.5) * 12;
          this.ctx.fillStyle = '#c1ff00'; // Lusion Acid Lime
        } else {
          // Subtle idle static bars when OFF
          barHeight = 4 + (Math.sin(t * 0.5 + i) * 0.5 + 0.5) * 3;
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        }

        const x = startX + i * (barWidth + gap);
        const y = (h - barHeight) / 2;

        this.ctx.beginPath();
        this.ctx.roundRect(x, y, barWidth, barHeight, 2);
        this.ctx.fill();
      }
    };

    render();
  }
}
