# LUSION Interactive Web Experience — High-Fidelity Replication

An ultra high-fidelity, production-grade replication of [Lusion.co](https://lusion.co)'s iconic, award-winning interactive 3D web experience. 

Built with **Three.js**, **Rapier 3D Physics (WebAssembly)**, **React Three Fiber / Drei**, **GSAP ScrollTrigger**, and **Lenis Smooth Scroll**, this project faithfully reconstructs Lusion's signature interactive physics, 2.5D stereoscopic depth displacement, dynamic 3D spline growth, and buttery-smooth cursor choreography.

---

## ✨ Key Features & Interactive Architecture

### 1. 3D Hero Connectors Physics Window
- **Authentic 3D Industrial Models**: Features the authentic multi-joint cross connectors (`c-transformed-cSRImfZN.glb`) with industrial bevels and counter-bore socket holes.
- **WASM Rigid Body Physics Engine**: Powered by `@dimforge/rapier3d-compat` WebAssembly (`rapier_wasm3d_bg.wasm`), executing real-time 3D rigid-body collision dynamics (3 `CuboidCollider` per connector) with Kinematic mouse pointer collider.
- **Studio Lighting & Post-Processing**: Drei `Lightformer` 4-directional studio reflection panels and Screen Space Ambient Occlusion (`N8AO`) for hyper-realistic plastic and metallic reflections.
- **Interactive Impulse & Color Cycling**: Click/drag to push connectors with realistic momentum; clicking connectors triggers physics impulses and cycles through signature Lusion hues (`#4060ff`, `#20ffa0`, `#ff4060`, `#ffcc00`).
- **Seamless Transparent Hand Gesture Cursor**: Zero-boundary pointer synchronization that allows the custom hand cursor to freely enter and manipulate the 3D scene without white container plates or edge friction.

### 2. Showreel Dynamic 3D Blue Ribbon
- **Volumetric TubeGeometry Spline**: Real-time 3D tube geometry with normal-based directional lighting, specular gloss highlights, and electric blue gradients (`#4e7aff` to `#1a2ffb`).
- **Dynamic Growth & Scroll Coordination**: Coordinated with GSAP `ScrollTrigger` and Lenis to dynamically draw along the curve with a leading glowing sphere head, strictly confined to the Showreel storytelling section.

### 3. 2.5D Depth Map Parallax Cards
- **Stereoscopic Depth Displacement Shader**: Custom WebGL shader mapping grayscale depth maps (`home_depth.webp`) onto RGB images (`home.webp`) for all 12 project showcase cards.
- **Edge-Preserving Occlusion Filter**: Mathematical thresholding that eliminates foreground text tearing, double images ("重影"), and chromatic aberration halos on high-contrast text boundaries.
- **Second-Order Dynamics Spring Physics**: Cursor-driven card parallax tracked via second-order spring dynamics for organic physical inertia.

### 4. Global Typography & Cursor System
- **High-Contrast Dual-Stroke Cursor**: Smart adaptive custom cursor with black core, white outline, and drop-shadow, guaranteeing 100% visibility over both dark 3D windows and light typography sections.
- **Matrix Text Scramble Decoder**: Hacker-style alphanumeric character decoding effect on button and link hovers.
- **Magnetic Action Buttons**: Spring-loaded magnetic hover buttons with audio chime feedback.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **3D & Graphics** | Three.js, React Three Fiber, @react-three/drei, WebGL Shader (GLSL) |
| **Physics Simulation** | @dimforge/rapier3d-compat (WebAssembly 3D Physics) |
| **Animation & Timing** | GSAP 3 (ScrollTrigger, quickTo, matchMedia, timelines) |
| **Smooth Scrolling** | Lenis Scroll |
| **Build & Tooling** | Vite 6, Modern ES Modules |

---

## 📁 Project Directory Structure

```text
├── index.html                    # Main entry HTML with semantic layout & custom cursor
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite build configuration
├── public/                       # Static public assets served by Vite
│   ├── assets/
│   │   ├── images/               # Backgrounds, posters, and tunnel textures
│   │   └── projects/             # 12 Project cards (home.webp + home_depth.webp)
│   └── lusion-connectors/        # Standalone Rapier 3D WASM connectors application
│       ├── index.html            # Embedded 3D viewport with pointer bridge
│       └── assets/               # Production bundle, GLB model & Rapier WASM binary
├── src/
│   ├── main.js                   # Application bootstrap & lifecycle management
│   ├── style.css                 # Typography, theme variables & responsive CSS
│   ├── animations/
│   │   ├── cursor.js             # High-performance 120fps cursor tracking & gestures
│   │   ├── magnetic.js           # Spring-physics magnetic buttons
│   │   ├── menu.js               # Fullscreen overlay navigation menu
│   │   ├── scroll.js             # Lenis & GSAP ScrollTrigger timeline orchestration
│   │   └── textAnimation.js      # Matrix alphanumeric character scramble decoder
│   ├── utils/
│   │   ├── AudioManager.js       # Web Audio API interactive sound synthesized chimes
│   │   └── SecondOrderDynamics.js # Exact second-order spring differential equation solver
│   └── webgl/
│       ├── SceneManager.js       # Global Three.js scene controller
│       ├── DepthCardMesh.js      # 2.5D depth parallax shader with occlusion filter
│       ├── ReelRibbon.js         # Showreel dynamic growing 3D electric blue spline
│       ├── HomeBalloons.js       # Interactive WebGL background particle/balloon meshes
│       └── WarpTunnel.js         # Infinite perspective warp zoom effect
└── scripts/                      # Automated asset download & validation scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pyw110001/LUSION-RE.git
   cd LUSION-RE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://127.0.0.1:3000/ (or the port displayed in your terminal)
   ```

### Building for Production

Compile optimized production bundle to the `dist/` directory:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 📄 Documentation

For technical post-mortems, bug analyses, and detailed solutions encountered during development (including Rapier WASM path handling, iframe pointer bridging, depth shader ghosting elimination, and ScrollTrigger coordinate synchronization), see **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**.

---

## ⚖️ Credits & Acknowledgements

- Visual design, concept, and creative direction inspired by **[Lusion.co](https://lusion.co)**.
- 3D connector models and Rapier 3D physics setup adapted from the open-source **[pmndrs](https://github.com/pmndrs/examples)** community.
- Built for educational, research, and non-commercial portfolio purposes.
