import * as THREE from 'three';

// Material preset templates matching Lusion's SOFT_PLASTIC, HARD_PLASTIC, STONE
const PALETTES = [
  { color: 0x1a2ffb, roughness: 0.15, metalness: 0.1, radius: 1.8 }, // Electric Blue Gloss
  { color: 0xc1ff00, roughness: 0.35, metalness: 0.05, radius: 1.4 }, // Acid Lime
  { color: 0xffffff, roughness: 0.1, metalness: 0.85, radius: 1.6 }, // Chrome / Gloss White
  { color: 0x15161a, roughness: 0.9, metalness: 0.0, radius: 2.2 }, // Dark Stone
  { color: 0x8832f7, roughness: 0.2, metalness: 0.1, radius: 1.3 }, // Purple Gloss
  { color: 0xff4c41, roughness: 0.4, metalness: 0.0, radius: 1.1 }, // Neon Orange-Red
  { color: 0x071bdf, roughness: 0.1, metalness: 0.3, radius: 1.9 }, // Deep Cobalt
  { color: 0xe4e6ef, roughness: 0.25, metalness: 0.05, radius: 1.5 }, // Soft Off-White
  { color: 0x1a2ffb, roughness: 0.5, metalness: 0.0, radius: 1.2 }, // Matte Blue
  { color: 0xc1ff00, roughness: 0.1, metalness: 0.2, radius: 1.7 }, // Gloss Lime
  { color: 0x22232a, roughness: 0.85, metalness: 0.1, radius: 2.0 }, // Charcoal Stone
  { color: 0xffffff, roughness: 0.05, metalness: 0.95, radius: 1.3 }, // Mirror Silver
];

export class HomeBalloonsBody {
  constructor(config, index) {
    this.index = index;
    this.radius = config.radius;
    this.mass = Math.pow(this.radius, 3) * 1.2;
    this.restitution = 0.8;
    this.friction = 0.5;
    this.frictionTot = 0;

    // Center of gravity on desktop: shifted to the right so it balances with the left-aligned hero title
    const isDesktop = window.innerWidth > 900;
    this.centerTarget = new THREE.Vector3(isDesktop ? 4.0 : 0, 0, 0);

    // Initial random spread
    const angle = (index / PALETTES.length) * Math.PI * 2;
    const dist = 3 + Math.random() * 4;
    this.position = new THREE.Vector3(
      this.centerTarget.x + Math.cos(angle) * dist,
      this.centerTarget.y + Math.sin(angle) * dist,
      (Math.random() - 0.5) * 4
    );

    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );

    this.gravityAcc = new THREE.Vector3();
    this.gravityForce = new THREE.Vector3();
  }

  updateGravity(dt, centerOffset = null) {
    const target = centerOffset ? this.centerTarget.clone().add(centerOffset) : this.centerTarget;
    const GRAVITY_FACTOR = 30;

    // Pull toward center target
    this.gravityForce.copy(this.position).sub(target).negate().multiplyScalar(GRAVITY_FACTOR);
    this.gravityAcc.copy(this.gravityForce).multiplyScalar(1 / this.mass);
    this.gravityAcc.multiplyScalar(1 / (1 + this.frictionTot));
    this.velocity.addScaledVector(this.gravityAcc, dt);
    this.frictionTot *= 0.85;
  }

  update(dt) {
    this.position.addScaledVector(this.velocity, dt);
    // Damping resistance
    this.velocity.multiplyScalar(Math.pow(0.55, dt));
  }
}

export class HomeBalloons {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.bodies = [];
    this.meshes = [];

    this.mouseWorld = new THREE.Vector3();
    this.prevMouseWorld = new THREE.Vector3();
    this.mouseVelocity = new THREE.Vector3();
    this.scrollProgress = 0;

    this.initLights();
    this.initBalloons();
  }

  initLights() {
    // Studio lighting for realistic PBR balloon shading
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.group.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(12, 16, 14);
    this.group.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x1a2ffb, 1.8);
    fillLight.position.set(-14, -10, -6);
    this.group.add(fillLight);

    const rimLight = new THREE.PointLight(0xc1ff00, 3.5, 30);
    rimLight.position.set(6, -8, 8);
    this.group.add(rimLight);
  }

  initBalloons() {
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 48);

    PALETTES.forEach((preset, i) => {
      const body = new HomeBalloonsBody(preset, i);
      this.bodies.push(body);

      const material = new THREE.MeshStandardMaterial({
        color: preset.color,
        roughness: preset.roughness,
        metalness: preset.metalness,
      });

      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.scale.setScalar(body.radius);
      mesh.position.copy(body.position);
      this.group.add(mesh);
      this.meshes.push(mesh);
    });
  }

  onPointerMove(screenX, screenY) {
    // Screen coords (-1 to 1) -> 3D world ray
    const p = new THREE.Vector3(screenX, screenY, 0.5);
    p.unproject(this.camera);
    p.sub(this.camera.position).normalize();

    // Intersect plane Z = 0
    const dist = -this.camera.position.z / p.z;
    this.mouseWorld.copy(this.camera.position).addScaledVector(p, dist);

    // Mouse velocity vector
    this.mouseVelocity.copy(this.mouseWorld).sub(this.prevMouseWorld);
    this.prevMouseWorld.copy(this.mouseWorld);

    // Apply push impulse to balloons within interaction radius
    const pushRadius = 3.8;
    this.bodies.forEach((body) => {
      const delta = body.position.clone().sub(this.mouseWorld);
      delta.z *= 0.5; // flatten z interaction
      const distance = delta.length();

      if (distance < pushRadius + body.radius) {
        delta.normalize();
        const strength = Math.max(0, 1 - distance / (pushRadius + body.radius));
        const impulse = delta.multiplyScalar(strength * 35);
        // Add tangential spin velocity
        impulse.addScaledVector(this.mouseVelocity, 8.0);
        body.velocity.addScaledVector(impulse, 1 / body.mass);
      }
    });
  }

  applyExplosion(point = this.mouseWorld) {
    this.bodies.forEach((body) => {
      const delta = body.position.clone().sub(point);
      delta.normalize();
      body.velocity.addScaledVector(delta, 25 / body.mass);
    });
  }

  setScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  update(dt) {
    const clampedDt = Math.min(dt, 0.033);

    // Adjust balloon position based on scroll (scatter and fly up on scroll)
    const scrollOffsetY = new THREE.Vector3(0, this.scrollProgress * 25, -this.scrollProgress * 15);
    const centerOffset = new THREE.Vector3(
      window.innerWidth > 900 ? 3.8 : 0,
      Math.sin(Date.now() * 0.001) * 0.4,
      0
    );

    // 1. Update Gravity & External Forces
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].updateGravity(clampedDt, centerOffset);
    }

    // 2. Elastic Sphere-to-Sphere Collision Detection
    for (let i = 0; i < this.bodies.length; i++) {
      const b1 = this.bodies[i];
      for (let j = i + 1; j < this.bodies.length; j++) {
        const b2 = this.bodies[j];
        const normal = b1.position.clone().sub(b2.position);
        const dist = normal.length();
        const minDist = b1.radius + b2.radius;

        if (dist < minDist && dist > 0.0001) {
          normal.normalize();
          // Separate overlap
          const overlap = (minDist - dist) * 0.5;
          b1.position.addScaledVector(normal, overlap);
          b2.position.addScaledVector(normal, -overlap);

          // Momentum exchange
          const v1 = b1.velocity.dot(normal);
          const v2 = b2.velocity.dot(normal);

          const m1 = b1.mass;
          const m2 = b2.mass;
          const restitution = 0.85;

          const impulse1 = ((m1 - restitution * m2) * v1 + (1 + restitution) * m2 * v2) / (m1 + m2);
          const impulse2 = ((m2 - restitution * m1) * v2 + (1 + restitution) * m1 * v1) / (m1 + m2);

          b1.velocity.addScaledVector(normal, impulse1 - v1);
          b2.velocity.addScaledVector(normal, impulse2 - v2);
        }
      }
    }

    // 3. Update Positions & Sync Meshes
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i];
      body.update(clampedDt);

      const mesh = this.meshes[i];
      mesh.position.copy(body.position).add(scrollOffsetY);

      // Subtle natural spin
      mesh.rotation.x += body.velocity.y * 0.05;
      mesh.rotation.y += body.velocity.x * 0.05;
    }

    // Fade out balloons as user scrolls past hero
    const heroAlpha = Math.max(0, 1 - this.scrollProgress * 3.5);
    this.group.visible = heroAlpha > 0.01;
  }
}
