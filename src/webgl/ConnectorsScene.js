import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Color themes matching pmndrs.github.io/examples/lusion-connectors
const ACCENT_COLORS = ['#1a33ff', '#20ffa0', '#ff3366', '#ffb700'];

export class ConnectorsScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.container = canvas.parentElement;

    this.accentIndex = 0;
    this.connectors = [];
    this.mouseWorld = new THREE.Vector3(999, 999, 0);
    this.mouseTarget = new THREE.Vector3(999, 999, 0);
    this.isHovered = false;

    this.init();
    this.addListeners();
    this.animate();
  }

  init() {
    this.width = Math.max(this.container.clientWidth || 0, window.innerWidth - 80);
    this.height = Math.max(this.container.clientHeight || 0, Math.min(window.innerHeight * 0.62, 600));

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#141622');

    // 2. Camera - wide, crisp framing matching user's Image 2
    this.camera = new THREE.PerspectiveCamera(22, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 16);

    // 3. Renderer with high dynamic range and anti-aliasing
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    // 4. Studio Lighting matching Image 2 specular highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    // Key Light from top-right for bright rim reflection
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(10, 15, 12);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    // Soft Blue Fill Light from bottom-left
    const fillLight = new THREE.DirectionalLight(0x4060ff, 2.2);
    fillLight.position.set(-12, -8, 6);
    this.scene.add(fillLight);

    // Top Rim Specular Light
    const topLight = new THREE.PointLight(0xffffff, 3.0, 35);
    topLight.position.set(0, 10, 4);
    this.scene.add(topLight);

    this.clock = new THREE.Clock();

    // 5. Build geometry synchronously so screen is NEVER black on frame 1
    this.defaultGeometry = this.createCompoundConnectorGeometry();
    this.buildConnectors(this.defaultGeometry);

    // 6. Asynchronously attempt to load GLB as progressive enhancement
    this.tryLoadGLB();
  }

  createCompoundConnectorGeometry() {
    // Construct exact 3D cross with 3 orthogonal intersecting cylinders with end bevels and holes
    const geoms = [];
    const radius = 0.44;
    const length = 2.6;
    const segments = 24;

    // Arm 1: Y-axis
    const geoY = new THREE.CylinderGeometry(radius, radius, length, segments);
    geoms.push(geoY);

    // Arm 2: X-axis
    const geoX = new THREE.CylinderGeometry(radius, radius, length, segments);
    geoX.rotateZ(Math.PI / 2);
    geoms.push(geoX);

    // Arm 3: Z-axis
    const geoZ = new THREE.CylinderGeometry(radius, radius, length, segments);
    geoZ.rotateX(Math.PI / 2);
    geoms.push(geoZ);

    // 6 end hole indentations (using BufferGeometry.translate / rotate)
    const half = length / 2;
    const holeRadius = 0.22;
    const holeDepth = 0.08;

    const makeHole = (x, y, z, rx, ry, rz) => {
      const hole = new THREE.CylinderGeometry(holeRadius, holeRadius, holeDepth, 16);
      if (rx) hole.rotateX(rx);
      if (ry) hole.rotateY(ry);
      if (rz) hole.rotateZ(rz);
      hole.translate(x, y, z);
      return hole;
    };

    geoms.push(makeHole(0, half, 0, 0, 0, 0));
    geoms.push(makeHole(0, -half, 0, 0, 0, 0));
    geoms.push(makeHole(half, 0, 0, 0, 0, Math.PI / 2));
    geoms.push(makeHole(-half, 0, 0, 0, 0, Math.PI / 2));
    geoms.push(makeHole(0, 0, half, Math.PI / 2, 0, 0));
    geoms.push(makeHole(0, 0, -half, Math.PI / 2, 0, 0));

    const merged = BufferGeometryUtils.mergeGeometries(geoms);
    merged.computeVertexNormals();
    return merged;
  }

  tryLoadGLB() {
    try {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/gltf/');

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        '/assets/models/connectors.glb',
        (gltf) => {
          let glbGeo = null;
          gltf.scene.traverse((child) => {
            if (child.isMesh && !glbGeo) {
              glbGeo = child.geometry.clone();
              glbGeo.center();
              glbGeo.scale(10, 10, 10);
            }
          });

          if (glbGeo) {
            this.connectors.forEach((c) => {
              c.mesh.geometry.dispose();
              c.mesh.geometry = glbGeo;
            });
          }
        },
        undefined,
        (err) => console.log('Using procedural connectors:', err)
      );
    } catch (e) {
      console.log('Using procedural connectors fallback');
    }
  }

  buildConnectors(geometry) {
    // Clear existing
    this.connectors.forEach(c => this.scene.remove(c.mesh));
    this.connectors = [];

    // Configurations matching the exact distribution in user's Image 2
    const configs = [
      { type: 'white',  scale: 1.18, pos: [0.3, -0.6, 2.5],  roughness: 0.14, metalness: 0.05, clearcoat: 0.6 }, // Big white front center
      { type: 'accent', scale: 1.12, pos: [1.3, 0.8, 1.8],   roughness: 0.12, metalness: 0.15, clearcoat: 0.9 }, // Big blue top-center
      { type: 'accent', scale: 1.05, pos: [-2.4, 0.2, 1.2],  roughness: 0.12, metalness: 0.15, clearcoat: 0.9 }, // Blue mid-left
      { type: 'white',  scale: 1.1,  pos: [2.5, -1.1, 1.5],  roughness: 0.14, metalness: 0.05, clearcoat: 0.6 }, // White bottom-right
      { type: 'black',  scale: 1.1,  pos: [-1.8, -1.4, 1.0], roughness: 0.8,  metalness: 0.08, clearcoat: 0.1 }, // Black bottom-left
      { type: 'black',  scale: 1.05, pos: [0.8, -1.7, 0.5],  roughness: 0.82, metalness: 0.08, clearcoat: 0.1 }, // Black bottom center
      { type: 'black',  scale: 1.0,  pos: [-0.9, 0.9, 0.2],  roughness: 0.8,  metalness: 0.08, clearcoat: 0.1 }, // Black top-center
      { type: 'white',  scale: 1.0,  pos: [-0.3, 1.3, -0.5], roughness: 0.16, metalness: 0.05, clearcoat: 0.6 }, // White top
      { type: 'accent', scale: 1.05, pos: [-3.8, -0.8, 0.0], roughness: 0.12, metalness: 0.15, clearcoat: 0.9 }, // Blue far left
      { type: 'black',  scale: 1.0,  pos: [3.4, 0.4, -0.4],  roughness: 0.82, metalness: 0.08, clearcoat: 0.1 }, // Black right
      { type: 'white',  scale: 0.95, pos: [2.0, 1.6, -0.8],  roughness: 0.16, metalness: 0.05, clearcoat: 0.6 }, // White top-right
      { type: 'accent', scale: 1.0,  pos: [3.8, 1.3, -1.0],  roughness: 0.12, metalness: 0.15, clearcoat: 0.9 }, // Blue far right
    ];

    const currentAccent = ACCENT_COLORS[this.accentIndex];

    configs.forEach((cfg) => {
      let color = currentAccent;
      if (cfg.type === 'white') color = '#ffffff';
      if (cfg.type === 'black') color = '#181920';

      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: cfg.roughness,
        metalness: cfg.metalness,
        clearcoat: cfg.clearcoat || 0.5,
        clearcoatRoughness: 0.1
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.scale.setScalar(cfg.scale);

      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.scene.add(mesh);

      this.connectors.push({
        mesh,
        cfg,
        originPos: new THREE.Vector3(cfg.pos[0], cfg.pos[1], cfg.pos[2]),
        position: mesh.position,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4
        ),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ),
        radius: cfg.scale * 1.35,
        mass: cfg.scale * 1.5
      });
    });
  }

  addListeners() {
    window.addEventListener('resize', this.onResize.bind(this));

    this.container.addEventListener('pointerenter', () => {
      this.isHovered = true;
    });

    this.container.addEventListener('pointerleave', () => {
      this.isHovered = false;
      this.mouseTarget.set(999, 999, 0);
    });

    this.container.addEventListener('pointermove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Project onto Z = 1.0 plane where connectors float
      const p = new THREE.Vector3(x, y, 0.5);
      p.unproject(this.camera);
      p.sub(this.camera.position).normalize();
      const dist = (1.0 - this.camera.position.z) / p.z;
      this.mouseTarget.copy(this.camera.position).addScaledVector(p, dist);
    });

    this.container.addEventListener('click', () => {
      this.cycleColor();
      this.explode();
    });
  }

  cycleColor() {
    this.accentIndex = (this.accentIndex + 1) % ACCENT_COLORS.length;
    const newColor = new THREE.Color(ACCENT_COLORS[this.accentIndex]);

    this.connectors.forEach((item) => {
      if (item.cfg.type === 'accent') {
        item.mesh.material.color.copy(newColor);
      }
    });
  }

  explode() {
    this.connectors.forEach((item) => {
      const dir = item.position.clone();
      dir.z += (Math.random() - 0.5) * 1.5;
      dir.normalize();
      item.velocity.addScaledVector(dir, 8 + Math.random() * 6);
      item.angularVelocity.set(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      );
    });
  }

  onResize() {
    this.width = Math.max(this.container.clientWidth || 0, window.innerWidth - 80);
    this.height = Math.max(this.container.clientHeight || 0, Math.min(window.innerHeight * 0.62, 600));
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const dt = Math.min(this.clock.getDelta(), 0.033);

    // Smooth mouse interpolation
    this.mouseWorld.lerp(this.mouseTarget, 0.2);

    // Physics update
    const pushRadius = 2.8;

    for (let i = 0; i < this.connectors.length; i++) {
      const c1 = this.connectors[i];

      // 1. Mouse repulsive force
      if (this.isHovered) {
        const deltaM = c1.position.clone().sub(this.mouseWorld);
        deltaM.z *= 0.8;
        const distM = deltaM.length();
        if (distM < pushRadius + c1.radius) {
          deltaM.normalize();
          const force = Math.max(0, 1 - distM / (pushRadius + c1.radius)) * 28;
          c1.velocity.addScaledVector(deltaM, (force / c1.mass) * dt);
          c1.angularVelocity.x += (Math.random() - 0.5) * 1.5 * dt;
          c1.angularVelocity.y += (Math.random() - 0.5) * 1.5 * dt;
        }
      }

      // 2. Soft elastic return to anchor origin
      const returnForce = c1.originPos.clone().sub(c1.position);
      c1.velocity.addScaledVector(returnForce, 0.6 * dt);

      // 3. Connector-to-connector collision
      for (let j = i + 1; j < this.connectors.length; j++) {
        const c2 = this.connectors[j];
        const normal = c1.position.clone().sub(c2.position);
        const dist = normal.length();
        const minDist = (c1.radius + c2.radius) * 0.85;

        if (dist < minDist && dist > 0.001) {
          normal.normalize();
          const overlap = (minDist - dist) * 0.5;
          c1.position.addScaledVector(normal, overlap);
          c2.position.addScaledVector(normal, -overlap);

          const v1 = c1.velocity.dot(normal);
          const v2 = c2.velocity.dot(normal);
          const e = 0.75; // restitution

          const imp1 = ((c1.mass - e * c2.mass) * v1 + (1 + e) * c2.mass * v2) / (c1.mass + c2.mass);
          const imp2 = ((c2.mass - e * c1.mass) * v2 + (1 + e) * c1.mass * v1) / (c1.mass + c2.mass);

          c1.velocity.addScaledVector(normal, imp1 - v1);
          c2.velocity.addScaledVector(normal, imp2 - v2);
        }
      }

      // 4. Integrate translation & rotation
      c1.position.addScaledVector(c1.velocity, dt);
      c1.velocity.multiplyScalar(Math.pow(0.88, dt * 10)); // smooth velocity damping

      c1.mesh.rotation.x += c1.angularVelocity.x * dt;
      c1.mesh.rotation.y += c1.angularVelocity.y * dt;
      c1.mesh.rotation.z += c1.angularVelocity.z * dt;
      c1.angularVelocity.multiplyScalar(Math.pow(0.92, dt * 10)); // rotation damping
    }

    this.renderer.render(this.scene, this.camera);
  }
}
