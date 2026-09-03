import * as THREE from 'three';
import { HomeBalloons } from './HomeBalloons.js';
import { WarpTunnel } from './WarpTunnel.js';
import { ReelRibbon } from './ReelRibbon.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.init();
    this.initHeroBalloons();
    this.initReelRibbon();
    this.initTunnel();
    this.addEventListeners();
    this.animate();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera: Match Lusion's FOV (25 to 45 deg)
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 24);

    // 3. Renderer with high performance & transparency
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.clock = new THREE.Clock();
  }

  initHeroBalloons() {
    this.balloons = new HomeBalloons(this.scene, this.camera);
  }

  initReelRibbon() {
    this.reelRibbon = new ReelRibbon(this.scene);
  }

  initTunnel() {
    this.tunnel = new WarpTunnel(this.scene);
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onPointerMove(e) {
    // Normalized coordinates (-1 to 1)
    const x = (e.clientX / this.width) * 2 - 1;
    const y = -(e.clientY / this.height) * 2 + 1;

    if (this.balloons) {
      this.balloons.onPointerMove(x, y);
    }
  }

  onClick() {
    if (this.balloons) {
      this.balloons.applyExplosion();
    }
  }

  setScrollProgress(progress) {
    if (this.balloons) {
      this.balloons.setScrollProgress(progress);
    }
  }

  setRibbonProgress(progress) {
    if (this.reelRibbon) {
      this.reelRibbon.setProgress(progress);
    }
  }

  setRibbonVisible(visible) {
    if (this.reelRibbon) {
      this.reelRibbon.setVisible(visible);
    }
  }

  setTunnelProgress(progress) {
    if (this.tunnel) {
      this.tunnel.setTunnelProgress(progress);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const dt = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.balloons) {
      this.balloons.update(dt);
    }

    if (this.tunnel) {
      this.tunnel.update(time);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
