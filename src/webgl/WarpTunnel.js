import * as THREE from 'three';

/**
 * WarpTunnel - 3D perspective vortex tunnel with rings and stars
 * Tied to ScrollTrigger pinning in the Goal section
 */
export class WarpTunnel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.visible = false;
    this.scene.add(this.group);

    this.rings = [];
    this.particles = null;
    this.scrollProgress = 0;

    this.init();
  }

  init() {
    // 1. Concentric neon wireframe rings
    const numRings = 24;
    for (let i = 0; i < numRings; i++) {
      const radius = 3.5 + (i * 0.1);
      const ringGeo = new THREE.TorusGeometry(radius, 0.04, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x1a2ffb : 0xc1ff00,
        transparent: true,
        opacity: 0.7 - (i / numRings) * 0.4,
        wireframe: true
      });

      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = -i * 3;
      this.group.add(ring);
      this.rings.push({ mesh: ring, initialZ: -i * 3 });
    }

    // 2. Swirling tunnel particles
    const particleCount = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pColor = new Float32Array(particleCount * 3);

    const colorLime = new THREE.Color(0xc1ff00);
    const colorBlue = new THREE.Color(0x1a2ffb);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 3.5;
      pPos[i * 3] = Math.cos(angle) * r;
      pPos[i * 3 + 1] = Math.sin(angle) * r;
      pPos[i * 3 + 2] = -Math.random() * 80;

      const clr = Math.random() > 0.5 ? colorLime : (Math.random() > 0.3 ? colorBlue : colorWhite);
      pColor[i * 3] = clr.r;
      pColor[i * 3 + 1] = clr.g;
      pColor[i * 3 + 2] = clr.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColor, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(pGeo, pMat);
    this.group.add(this.particles);
  }

  setTunnelProgress(progress) {
    this.scrollProgress = progress;
    // Visible only when goal section is active
    this.group.visible = progress > 0.05 && progress < 0.95;
  }

  update(time) {
    if (!this.group.visible) return;

    // Rotate tunnel rings
    this.rings.forEach((r, idx) => {
      r.mesh.rotation.z = time * 0.4 + idx * 0.1;
      // Fly forward based on scrollProgress
      const speedOffset = (this.scrollProgress * 50) % 72;
      let newZ = r.initialZ + speedOffset;
      if (newZ > 10) newZ -= 72;
      r.mesh.position.z = newZ;
    });

    // Animate particles rushing towards camera
    if (this.particles) {
      this.particles.rotation.z = time * 0.2;
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 2] += 0.4 + this.scrollProgress * 2.5;
        if (positions[i * 3 + 2] > 5) {
          positions[i * 3 + 2] = -75;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
