import * as THREE from 'three';
import { SecondOrderDynamics } from '../utils/SecondOrderDynamics.js';

/**
 * DepthCardMesh - Recreating Lusion's 2.5D Depth Map Parallax Shader
 * Loads home.webp (RGB) and home_depth.webp (Depth Map)
 * Real-time stereoscopic 3D parallax displacement driven by mouse movement
 */
const VERTEX_SHADER = `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform sampler2D u_texture;
  uniform sampler2D u_depthTexture;
  uniform vec2 u_mouse;
  uniform float u_strength;
  uniform float u_hover;
  varying vec2 v_uv;

  void main() {
    vec2 uv = v_uv;

    // Sample grayscale depth map (0 = deep background, 1 = pop-out foreground)
    float depth = texture2D(u_depthTexture, uv).r;

    // Calibrated parallax displacement vector
    vec2 offset = u_mouse * (depth - 0.5) * (u_strength * (0.3 + 0.7 * u_hover));

    // Clamp candidate sampling coordinate
    vec2 targetUv = clamp(uv + offset, 0.0, 1.0);
    float targetDepth = texture2D(u_depthTexture, targetUv).r;

    // Edge-preserving occlusion filter:
    // Prevents background pixels from bleeding across high-contrast edges into foreground text
    // Completely eliminates text ghosting, silhouette tearing, and double images
    float depthJump = max(0.0, targetDepth - depth);
    vec2 finalUv = mix(targetUv, uv, smoothstep(0.06, 0.22, depthJump));

    // Clean sampling without chromatic aberration splitting
    gl_FragColor = texture2D(u_texture, finalUv);
  }
`;

export class DepthCardMesh {
  constructor(container, imageSrc, depthSrc) {
    this.container = container;
    this.imageSrc = imageSrc;
    this.depthSrc = depthSrc;

    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);
    // Use SecondOrderDynamics for organic physical spring follow
    this.physics = new SecondOrderDynamics(new THREE.Vector2(0, 0), 1.8, 0.75, 2.0);
    this.hoverState = { current: 0, target: 0 };

    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'depth-card-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.borderRadius = 'inherit';
    this.canvas.style.objectFit = 'cover';
    this.container.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const loader = new THREE.TextureLoader();
    const texture = loader.load(this.imageSrc);
    const depthTexture = loader.load(this.depthSrc);

    texture.minFilter = THREE.LinearFilter;
    depthTexture.minFilter = THREE.LinearFilter;

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        u_texture: { value: texture },
        u_depthTexture: { value: depthTexture },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_strength: { value: 0.015 },
        u_hover: { value: 0 }
      }
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(quad);

    this.addListeners();
    this.resize();
    this.render();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.renderer.setSize(rect.width, rect.height, false);
    }
  }

  addListeners() {
    this.container.addEventListener('pointermove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.targetMouse.set(x, y);

      // Also 3D tilt the container
      const card = this.container.closest('.project-item-main');
      if (card) {
        card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
      }
    });

    this.container.addEventListener('mouseenter', () => {
      this.hoverState.target = 1;
    });

    this.container.addEventListener('mouseleave', () => {
      this.targetMouse.set(0, 0);
      this.hoverState.target = 0;
      const card = this.container.closest('.project-item-main');
      if (card) {
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
      }
    });

    window.addEventListener('resize', this.resize.bind(this));
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    // Update spring dynamics
    const pos = this.physics.update(0.016, this.targetMouse);
    this.material.uniforms.u_mouse.value.copy(pos);

    // Smooth hover transition
    this.hoverState.current += (this.hoverState.target - this.hoverState.current) * 0.1;
    this.material.uniforms.u_hover.value = this.hoverState.current;

    this.renderer.render(this.scene, this.camera);
  }
}
