# LUSION Interactive Web Experience — High-Fidelity Replication

<div align="center">

<p>
  <b>English</b> • <a href="#-中文说明">简体中文</a>
</p>

<p>An ultra high-fidelity, production-grade replication of <a href="https://lusion.co">Lusion.co</a>'s award-winning interactive 3D web experience.</p>

</div>

---

## English

### ✨ Key Features & Interactive Architecture

#### 1. 3D Hero Connectors Physics Window
- **Authentic 3D Industrial Models**: Features the authentic multi-joint cross connectors (`c-transformed-cSRImfZN.glb`) with industrial bevels and counter-bore socket holes.
- **WASM Rigid Body Physics Engine**: Powered by `@dimforge/rapier3d-compat` WebAssembly (`rapier_wasm3d_bg.wasm`), executing real-time 3D rigid-body collision dynamics (3 `CuboidCollider` per connector) with Kinematic mouse pointer collider.
- **Studio Lighting & Post-Processing**: Drei `Lightformer` 4-directional studio reflection panels and Screen Space Ambient Occlusion (`N8AO`) for hyper-realistic plastic and metallic reflections.
- **Interactive Impulse & Color Cycling**: Click/drag to push connectors with realistic momentum; clicking connectors triggers physics impulses and cycles through signature Lusion hues (`#4060ff`, `#20ffa0`, `#ff4060`, `#ffcc00`).
- **Seamless Transparent Hand Gesture Cursor**: Zero-boundary pointer synchronization that allows the custom hand cursor to freely enter and manipulate the 3D scene without white container plates or edge friction.

#### 2. Showreel Dynamic 3D Blue Ribbon
- **Volumetric TubeGeometry Spline**: Real-time 3D tube geometry with normal-based directional lighting, specular gloss highlights, and electric blue gradients (`#4e7aff` to `#1a2ffb`).
- **Dynamic Growth & Scroll Coordination**: Coordinated with GSAP `ScrollTrigger` and Lenis to dynamically draw along the curve with a leading glowing sphere head, strictly confined to the Showreel storytelling section.

#### 3. 2.5D Depth Map Parallax Cards
- **Stereoscopic Depth Displacement Shader**: Custom WebGL shader mapping grayscale depth maps (`home_depth.webp`) onto RGB images (`home.webp`) for all 12 project showcase cards.
- **Edge-Preserving Occlusion Filter**: Mathematical thresholding that eliminates foreground text tearing, double images ("重影"), and chromatic aberration halos on high-contrast text boundaries.
- **Second-Order Dynamics Spring Physics**: Cursor-driven card parallax tracked via second-order spring dynamics for organic physical inertia.

#### 4. Global Typography & Cursor System
- **High-Contrast Dual-Stroke Cursor**: Smart adaptive custom cursor with black core, white outline, and drop-shadow, guaranteeing 100% visibility over both dark 3D windows and light typography sections.
- **Matrix Text Scramble Decoder**: Hacker-style alphanumeric character decoding effect on button and link hovers.
- **Magnetic Action Buttons**: Spring-loaded magnetic hover buttons with audio chime feedback.

---

### 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **3D & Graphics** | Three.js, React Three Fiber, @react-three/drei, WebGL Shader (GLSL) |
| **Physics Simulation** | @dimforge/rapier3d-compat (WebAssembly 3D Physics) |
| **Animation & Timing** | GSAP 3 (ScrollTrigger, quickTo, matchMedia, timelines) |
| **Smooth Scrolling** | Lenis Scroll |
| **Build & Tooling** | Vite 6, Modern ES Modules |

---

### 📁 Project Directory Structure

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

### 🚀 Getting Started

#### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm**

#### Installation

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
   http://127.0.0.1:3000/
   ```

#### Building for Production

Compile optimized production bundle to the `dist/` directory:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

### 📄 Documentation

For technical post-mortems, bug analyses, and detailed solutions encountered during development (including Rapier WASM path handling, iframe pointer bridging, depth shader ghosting elimination, and ScrollTrigger coordinate synchronization), see **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**.

---

### ⚖️ Credits & Acknowledgements

- Visual design, concept, and creative direction inspired by **[Lusion.co](https://lusion.co)**.
- 3D connector models and Rapier 3D physics setup adapted from the open-source **[pmndrs](https://github.com/pmndrs/examples)** community.
- Built for educational, research, and non-commercial portfolio purposes.

---

## 🇨🇳 中文说明

### ✨ 核心交互与技术架构

#### 1. 3D Hero 十字接头物理仿真视窗
- **工业级 3D 模型资产**：采用 authentic 十字接头工业模型（`c-transformed-cSRImfZN.glb`），具备精准倒角与沉头螺孔细节。
- **WASM 刚体物理引擎**：基于 `@dimforge/rapier3d-compat` WebAssembly（`rapier_wasm3d_bg.wasm`）驱动，每个接头配备 3 个 `CuboidCollider` 复合碰撞体，鼠标指针配备运动学刚体（Kinematic Collider）碰撞检测。
- **棚拍摄影级光影与后处理**：采用 Drei `Lightformer` 四向反射柔光板与屏幕空间环境光遮蔽（`N8AO`），完美呈现磨砂与亮面塑料的细腻高光反射。
- **动量推撞与色谱裂变交互**：支持鼠标推拨产生连续动量回弹；点击接头触发物理脉冲冲击波并循环切换 Lusion 经典主题色（`#4060ff`、`#20ffa0`、`#ff4060`、`#ffcc00`）。
- **无感透传手势光标**：独创微内核指针事件穿梭桥接，手势光标可自由移入 3D 视窗深处操控，彻底去除白色外圈底盘，实现纯透明贴图浮动交互。

#### 2. Showreel 动态生长 3D 电光蓝曲线
- **3D 体积 TubeGeometry 样条管线**：基于法线矩阵的高光着色与电光蓝渐变（`#4e7aff` 至 `#1a2ffb`），质感通透立体。
- **滚动时序驱动与视窗约束**：与 GSAP `ScrollTrigger` 和 Lenis 深度绑定，随着用户在第二屏向下滚动平滑生长并附带发光球头；滚动离开第二屏时立即平滑隐藏，保持后续页面清爽。

#### 3. 2.5D 深度图视差卡片
- **双通道立体视差着色器**：定制 WebGL 片段着色器，将灰度深度图（`home_depth.webp`）映射至漫反射图（`home.webp`），为全站 12 张核心项目卡片注入 2.5D 悬浮纵深感。
- **边缘遮挡保护滤波（防重影算法）**：通过深度梯度检测（Occlusion Filter），智能拦截背景像素越界采样前景高对比文字的行为，彻底根除鼠标左右晃动时的“文字重影”、“字符克隆”与“彩边撕裂”。
- **二阶弹簧动力学追踪**：使用 `SecondOrderDynamics` 精确求解物理弹簧二阶微分方程，赋予卡片视差跟随天然的物理惯性与阻尼感。

#### 4. 全局高对比光标与黑客字符解码系统
- **黑白双层自适应光标**：黑芯白边加柔和投影的双层描边架构，在纯白页面背景与纯黑 3D 视窗之间切换均保持 100% 清晰可辨。
- **矩阵字符乱码渐进解码**：链接与按钮悬停时触发高科技 Alphanumeric 乱码渐进收敛动效。
- **磁吸按钮与音效反馈**：支持弹性磁吸悬停吸附，搭配 Web Audio API 合成实时高频微交互音效。

---

### 🛠️ 技术栈总览

| 领域 | 核心技术 |
| :--- | :--- |
| **3D 与图形渲染** | Three.js, React Three Fiber, @react-three/drei, WebGL 自定义着色器 (GLSL) |
| **物理动力学引擎** | @dimforge/rapier3d-compat (WebAssembly 3D 刚体物理) |
| **动画编排与时间轴** | GSAP 3 (ScrollTrigger, quickTo, matchMedia, timelines) |
| **平滑滚动管线** | Lenis Scroll |
| **构建工程化** | Vite 6, Modern ES Modules |

---

### 🚀 快速开始

#### 环境要求
- **Node.js**：`v18.0.0` 或更高版本
- **包管理器**：npm 或 pnpm

#### 安装与启动

1. 克隆代码仓库：
   ```bash
   git clone https://github.com/pyw110001/LUSION-RE.git
   cd LUSION-RE
   ```

2. 安装项目依赖：
   ```bash
   npm install
   ```

3. 启动本地开发服务：
   ```bash
   npm run dev
   ```

4. 打开浏览器访问：
   ```text
   http://127.0.0.1:3000/
   ```

#### 生产构建与打包预览

编译优化打包至 `dist/` 目录：
```bash
npm run build
```

本地预览生产构建产物：
```bash
npm run preview
```

---

### 📄 深入技术复盘与排障指南

关于项目开发过程中解决的关键技术难点（包括 Rapier WASM 打包路径修复、Iframe 指针跨域桥接、2.5D 视差着色器文字重影根除、ScrollTrigger 与 Lenis 平滑滚动对齐等），详见 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**。

---

### ⚖️ 致谢与声明

- 本项目视觉设计与创意灵感源自国际顶级创意工作室 **[Lusion.co](https://lusion.co)**；
- 3D 十字接头模型与物理碰撞配置借鉴了开源社区 **[pmndrs](https://github.com/pmndrs/examples)** 的杰出工作；
- 本项目仅用于前端前沿技术研发、三维图形学探索与非商业性学术研究。
