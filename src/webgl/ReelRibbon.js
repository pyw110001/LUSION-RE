import * as THREE from 'three';

/**
 * ReelRibbon - 3D dynamic growing blue spline pipeline matching Lusion.co Showreel (Section 2)
 * Follows an elegant, dynamic "Z" shape trajectory:
 * 1. Top bar of Z: Enters top-left, travels horizontally across the upper screen to top-right
 * 2. Diagonal slash of Z: Cuts diagonally down-left across the center, weaving over/behind the showreel card
 * 3. Bottom bar of Z: Turns at bottom-left and sweeps horizontally across to bottom-right
 * Strictly displayed ONLY in Section 2 (Showreel), never appears in subsequent sections.
 */
export class ReelRibbon {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.visible = false;
    this.scene.add(this.group);

    this.progress = 0;
    this.isVisible = false;

    this.initCurve();
    this.initMesh();
    this.initTip();
  }

  initCurve() {
    // 3D control points matching Lusion's original looping line_reel
    // Sweeps from top-left, loops behind the showreel card, and curves out to bottom-right
    const points = [
      new THREE.Vector3(-18, 14, -2),   // 0. Offscreen top-left
      new THREE.Vector3(-14, 8, 0),     // 1. Enter top-left
      new THREE.Vector3(-8, 3, 1.5),    // 2. Loop over card top
      new THREE.Vector3(-12, -1, 1.0),  // 3. Loop behind card left
      new THREE.Vector3(-14, -6, 0.5),  // 4. Loop under card
      new THREE.Vector3(-7, -8, -0.5),  // 5. Curve bottom-left
      new THREE.Vector3(0, -3, 1.0),    // 6. Swoop up towards center
      new THREE.Vector3(6, 1, 0.5),     // 7. Right under "Our Approach"
      new THREE.Vector3(11, -4, 0),     // 8. Curve towards right
      new THREE.Vector3(14, -12, -2)    // 9. Exit bottom-right
    ];

    this.curve = new THREE.CatmullRomCurve3(points);
    this.curve.curveType = 'catmullrom';
    this.curve.tension = 0.5;
  }

  initMesh() {
    this.tubeGeometry = new THREE.TubeGeometry(this.curve, 400, 0.32, 16, false);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_progress: { value: 0 },
        u_color0: { value: new THREE.Color('#4e7aff') },
        u_color1: { value: new THREE.Color('#1a2ffb') }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_progress;
        uniform vec3 u_color0;
        uniform vec3 u_color1;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          if (vUv.x > u_progress) {
            discard;
          }

          vec3 color = mix(u_color0, u_color1, vUv.x);
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
          float diff = max(dot(vNormal, lightDir), 0.0) * 0.45 + 0.65;
          float spec = pow(max(dot(reflect(-lightDir, vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 16.0) * 0.35;

          gl_FragColor = vec4(color * diff + spec, 1.0);
        }
      `,
      transparent: true,
      depthTest: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(this.tubeGeometry, this.material);
    this.group.add(this.mesh);
  }

  initTip() {
    const tipGeo = new THREE.SphereGeometry(0.36, 24, 24);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x6ba0ff });
    this.tipMesh = new THREE.Mesh(tipGeo, tipMat);
    this.group.add(this.tipMesh);
  }

  setVisible(visible) {
    this.isVisible = visible;
    this.updateVisibility();
  }

  setProgress(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    this.material.uniforms.u_progress.value = this.progress;

    if (this.progress > 0.005) {
      const pt = this.curve.getPointAt(this.progress);
      if (pt) {
        this.tipMesh.position.copy(pt);
        this.tipMesh.visible = this.progress < 0.99;
      }
    }

    this.updateVisibility();
  }

  updateVisibility() {
    // Only visible when explicitly in Section 2 and progress is active
    const show = this.isVisible && this.progress > 0.01 && this.progress < 0.995;
    this.group.visible = show;
    if (!show) {
      this.tipMesh.visible = false;
    }
  }
}
