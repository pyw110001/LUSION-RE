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
      this.soundBtn.setAttribute('aria-pressed', 'false');
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
    this.soundBtn?.classList.toggle('is-enabled', this.isEnabled);
    this.soundBtn?.setAttribute('aria-pressed', String(this.isEnabled));
    this.initAudio();

    if (this.isEnabled) {
      this.playChime(587.33, 'triangle'); // D5 chime
      setTimeout(() => this.playChime(880, 'sine'), 100); // A5 chime
    }
  }

  initVisualizer() {
    let t = 0;

    const render = () => {
      requestAnimationFrame(render);
      t += this.isEnabled ? 0.065 : 0.018;

      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);
      if (!this.isEnabled) return;

      const inset = 7;
      const centerY = h / 2;
      const width = w - inset * 2;
      const amplitude = h * (0.23 + Math.sin(t * 0.8) * 0.025);

      this.ctx.beginPath();
      for (let i = 0; i <= 48; i++) {
        const progress = i / 48;
        const x = inset + progress * width;
        const envelope = Math.pow(Math.sin(Math.PI * progress), 0.55);
        const harmonic = Math.sin(progress * Math.PI * 3.15 + t);
        const detail = Math.sin(progress * Math.PI * 6.3 - t * 0.7) * 0.12;
        const y = centerY + (harmonic + detail) * amplitude * envelope;

        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }

      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
    };

    render();
  }
}
