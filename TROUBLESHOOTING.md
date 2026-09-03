# LUSION Interactive Web Experience — Troubleshooting & Technical Post-Mortem

<div align="center">

<p>
  <b>English</b> • <a href="#-中文排障与技术复盘">简体中文</a>
</p>

<p>Technical post-mortems, root-cause analyses, and solutions for the Lusion replication project.</p>

</div>

---

## English

### 📑 Table of Contents
1. [3D Connectors Physics & Rapier WASM Path Resolution](#1-3d-connectors-physics--rapier-wasm-path-resolution)
2. [Iframe Boundary Friction & Custom Cursor Synchronization](#2-iframe-boundary-friction--custom-cursor-synchronization)
3. [Transparent Hand Gesture Cursor & White Disc Removal](#3-transparent-hand-gesture-cursor--white-disc-removal)
4. [2.5D Depth Map Parallax Card Ghosting & Silhouette Tearing](#4-25d-depth-map-parallax-card-ghosting--silhouette-tearing)
5. [Showreel 3D Blue Ribbon Lifetime & Section Confinement](#5-showreel-3d-blue-ribbon-lifetime--section-confinement)
6. [Lenis Smooth Scroll & GSAP ScrollTrigger Synchronization](#6-lenis-smooth-scroll--gsap-scrolltrigger-synchronization)
7. [Adaptive Dual-Stroke Cursor on High-Contrast Themes](#7-adaptive-dual-stroke-cursor-on-high-contrast-themes)

---

### 1. 3D Connectors Physics & Rapier WASM Path Resolution

#### Symptom
When embedding the 3D connectors simulation into `#hero-window-container`, the viewport showed a blank canvas with browser console 404 errors attempting to load `rapier_wasm3d_bg.wasm` and `c-transformed-cSRImfZN.glb`.

#### Root Cause
The production bundle imported from upstream examples contained hardcoded base paths formatted for `https://pmndrs.github.io/examples/lusion-connectors/`. When hosted on a local Vite root (`http://127.0.0.1:3000/`), relative asset resolution failed.

#### Solution
1. Staged assets cleanly in `public/lusion-connectors/assets/`.
2. Patched chunk `public/lusion-connectors/assets/index-Bm0SHfPu.js` to reference local `/lusion-connectors/` paths.
3. Verified Vite serves `.wasm` binaries with `Content-Type: application/wasm` with HTTP 200.

---

### 2. Iframe Boundary Friction & Custom Cursor Synchronization

#### Symptom
Moving the mouse from the main page into the 3D window caused the custom cursor to freeze at the top-left boundary of the iframe container. The cursor could not penetrate inside the 3D interaction space.

#### Root Cause
The browser's native security model isolates `<iframe>` pointer events. Pointer movements inside an iframe do not bubble to the parent `window`. When the pointer crossed the container border, parent `pointermove` listeners stopped receiving events, causing the custom cursor follower to remain stuck at the border coordinates.

#### Solution
Implemented a zero-latency bidirectional pointer bridge:
1. In `public/lusion-connectors/index.html`, added a lightweight event listener to forward pointer coordinates:
   ```javascript
   window.addEventListener('pointermove', (e) => {
     try {
       if (window.parent && window.parent.__onIframePointerMove) {
         window.parent.__onIframePointerMove(e.clientX, e.clientY);
       }
     } catch (err) {}
   });
   ```
2. In `src/animations/cursor.js`, computed parent client coordinates:
   ```javascript
   window.__onIframePointerMove = (iframeX, iframeY) => {
     const iframe = document.getElementById('hero-connectors-iframe');
     if (!iframe) return;
     const rect = iframe.getBoundingClientRect();
     xTo(rect.left + iframeX);
     yTo(rect.top + iframeY);
     cursorText.textContent = '';
     document.body.classList.add('cursor-hover-active', 'cursor-dark-theme', 'cursor-is-hand');
   };
   ```
3. Added `canvas { cursor: none !important; }` inside the iframe to hide the OS system cursor so the unified custom cursor glides effortlessly across the entire 3D window.

---

### 3. Transparent Hand Gesture Cursor & White Disc Removal

#### Symptom
When hovering over the 3D window, the hand cursor displayed an unwanted solid white circular background plate, resembling a white disc rather than a clean gesture icon.

#### Root Cause
The default hover state for buttons (`body.cursor-hover-active #cursor-ring`) enforced a 58px white circular pill with solid background and shadow for text labels.

#### Solution
1. In `src/style.css`, created dedicated styling rules for `body.cursor-is-hand #cursor-ring`:
   ```css
   body.cursor-is-hand #cursor-ring {
     width: auto !important;
     height: auto !important;
     top: -15px !important;
     left: -15px !important;
     background: transparent !important;
     background-color: transparent !important;
     border: none !important;
     box-shadow: none !important;
   }
   ```
2. Styled the SVG hand icon with solid white fill (`fill="#ffffff"`), crisp dark outline (`stroke="#111111" stroke-width="1.5"`), and a subtle drop shadow (`filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.65))`).
3. Added click/drag tactile feedback:
   ```css
   body.cursor-is-hand:active #cursor-hand-icon,
   body.cursor-is-hand.cursor-mouse-down #cursor-hand-icon {
     transform: scale(0.85);
   }
   ```

---

### 4. 2.5D Depth Map Parallax Card Ghosting & Silhouette Tearing

#### Symptom
When hovering over project cards (such as "Spaace" or "Atlas Motion") and shaking the mouse left and right, high-contrast typography ("spaace") suffered from severe double images, ghosting ("重影"), and colored fringes.

#### Root Cause
1. **Excessive Displacement Amplitude**: `u_strength` was set to `0.045`. On a 1000px card, a mouse offset of $\pm 0.8$ resulted in up to 30px of UV displacement.
2. **Pseudo-Chromatic Aberration**: Red, green, and blue channels were sampled at `1.03`, `1.0`, and `0.97` offsets, creating unnatural color-fringed duplicates.
3. **Occlusion Artifact (Double-Sampling)**: When foreground text was displaced, adjacent background pixels sampled from the shifted text region, creating a cloned ghost of the text next to the original letters.

#### Solution
1. **Edge-Preserving Occlusion Filter** (`src/webgl/DepthCardMesh.js`):
   Sampled `targetDepth` at the displaced coordinate. If `targetDepth > depth` across a sharp discontinuity, displacement is smoothly attenuated:
   ```glsl
   float depth = texture2D(u_depthTexture, uv).r;
   vec2 offset = u_mouse * (depth - 0.5) * (u_strength * (0.3 + 0.7 * u_hover));
   vec2 targetUv = clamp(uv + offset, 0.0, 1.0);
   float targetDepth = texture2D(u_depthTexture, targetUv).r;

   // Prevent background pixels from bleeding into foreground text
   float depthJump = max(0.0, targetDepth - depth);
   vec2 finalUv = mix(targetUv, uv, smoothstep(0.06, 0.22, depthJump));

   gl_FragColor = texture2D(u_texture, finalUv);
   ```
2. **Calibrated Strength**: Lowered `u_strength` from `0.045` to `0.015`.
3. **Eliminated Color Separation**: Sampled RGB channels together to ensure solid, razor-sharp typography.

---

### 5. Showreel 3D Blue Ribbon Lifetime & Section Confinement

#### Symptom
The 3D blue ribbon either leaked into subsequent project cards or disappeared abruptly when the user scrolled away from Showreel.

#### Root Cause
The ribbon path control points were previously spanning across the entire page, and pin-spacer scroll offsets were interfering with subsequent sections.

#### Solution
1. Restored the authentic 10-node CatmullRom spline strictly mapped to Section 2 (`#home-reel`):
   - Starts top-left: `(-18, 14, -2)`
   - Loops around the project card: `(-8, 3, 1.5) -> (-12, -1, 1.0) -> (-14, -6, 0.5)`
   - Sweeps under "Our Approach": `(0, -3, 1.0) -> (6, 1, 0.5)`
   - Curves down-right to exit: `(14, -12, -2)`
2. Bound lifecycle strictly in `src/animations/scroll.js`:
   ```javascript
   ScrollTrigger.create({
     trigger: "#home-reel",
     start: "top top",
     end: "+=2600",
     pin: true,
     scrub: 1,
     onEnter: () => sceneManager?.setRibbonVisible(true),
     onEnterBack: () => sceneManager?.setRibbonVisible(true),
     onLeave: () => sceneManager?.setRibbonVisible(false),
     onLeaveBack: () => sceneManager?.setRibbonVisible(false),
     onUpdate: (self) => sceneManager?.setRibbonProgress(self.progress)
   });
   ```
3. Exiting Section 2 downward immediately sets `visible = false`, guaranteeing subsequent sections remain clean.

---

### 6. Lenis Smooth Scroll & GSAP ScrollTrigger Synchronization

#### Symptom
Programmatic jumps or rapid mouse-wheel inputs caused ScrollTrigger triggers to desynchronize or lag behind the actual scroll viewport position.

#### Root Cause
Lenis manages its own smooth virtual scroll loop. If not explicitly bound to GSAP's ticker, ScrollTrigger evaluates native scroll positions that do not match Lenis's interpolated virtual positions.

#### Solution
Bound Lenis to GSAP ticker in `src/animations/scroll.js`:
```javascript
lenis.on('scroll', (e) => {
  ScrollTrigger.update();
  if (sceneManager) {
    const scrollProgress = e.progress || (window.scrollY / (document.body.scrollHeight - window.innerHeight));
    sceneManager.setScrollProgress(scrollProgress);
  }
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

---

### 7. Adaptive Dual-Stroke Cursor on High-Contrast Themes

#### Symptom
A single-color custom cursor (white only or black only) became invisible when transitioning between light typography sections (`#ffffff` background) and dark 3D windows (`#0c0d12` background).

#### Root Cause
Monochrome cursors rely on inversion filters or contrast with one background color, failing when encountering mixed content.

#### Solution
Created a layered dual-stroke structure in `src/style.css`:
- `#cursor-dot`: Solid black core (`#000000`), surrounded by a 1.5px semi-transparent white border and a 3px drop-shadow.
- `#cursor-ring`: Dual border layers (inner dark border + outer light glow).
- When hovering over dark 3D containers (`#hero-window-container`), dynamically toggles `.cursor-dark-theme` to invert text and stroke contrast instantly.

---

## 🇨🇳 中文排障与技术复盘

### 📑 目录
1. [3D 十字接头物理仿真与 Rapier WASM 资源路径重定向](#1-3d-十字接头物理仿真与-rapier-wasm-资源路径重定向)
2. [Iframe 文档边界隔离与 120fps 自定义光标微内核穿梭](#2-iframe-文档边界隔离与-120fps-自定义光标微内核穿梭)
3. [纯透明手势贴图光标与外圈白盘彻底清除](#3-纯透明手势贴图光标与外圈白盘彻底清除)
4. [2.5D 深度视差卡片文字重影与边缘撕裂根除算法](#4-25d-深度视差卡片文字重影与边缘撕裂根除算法)
5. [Showreel 3D 蓝色曲线生命周期管理与钉住坐标对齐](#5-showreel-3d-蓝色曲线生命周期管理与钉住坐标对齐)
6. [Lenis 虚拟平滑滚动与 GSAP ScrollTrigger 渲染管线对齐](#6-lenis-虚拟平滑滚动与-gsap-scrolltrigger-渲染管线对齐)
7. [复杂明暗交替背景下的黑白双层高对比自适应光标](#7-复杂明暗交替背景下的黑白双层高对比自适应光标)

---

### 1. 3D 十字接头物理仿真与 Rapier WASM 资源路径重定向

#### 故障现象
在首页嵌入十字接头物理视窗时，页面控制台频繁报 404 错误，提示无法加载 `rapier_wasm3d_bg.wasm` 物理引擎二进制文件与 `c-transformed-cSRImfZN.glb` 3D 模型，导致视窗呈现黑屏。

#### 根本原因分析
上游构建的 JS Bundle 中硬编码了 `https://pmndrs.github.io/examples/lusion-connectors/` 的绝对网络基准路径。在本地 Vite 6 开发与构建环境中，路径未能正确定位至本地静态资源目录。

#### 解决方案
1. 将模型和 WASM 完整收敛至 `public/lusion-connectors/assets/` 静态目录；
2. 批量重构 `index-Bm0SHfPu.js` 中的资源基准路径为相对根路径 `/lusion-connectors/`；
3. 确保本地服务对 `.wasm` 文件响应 `Content-Type: application/wasm` 头，物理引擎得以秒级秒开初始化。

---

### 2. Iframe 文档边界隔离与 120fps 自定义光标微内核穿梭

#### 故障现象
当主站鼠标移动至 3D 交互窗口边缘时，自定义小圆点光标被硬生生阻断在 Iframe 边框外侧，无法进入 3D 视窗内部拨弄接头。

#### 根本原因分析
浏览器原生安全沙箱机制使得 `<iframe>` 内部的 `pointermove` 事件无法自然冒泡至父级 `window`。当鼠标指针进入 Iframe，宿主窗口监听器直接断流，导致 GSAP 光标坐标维持在切入点的最后一帧。

#### 解决方案
构建微内核级别的双向指针穿梭桥（Pointer Bridge）：
1. 在嵌入页 `public/lusion-connectors/index.html` 内注入极简轻量监听：
   ```javascript
   window.addEventListener('pointermove', (e) => {
     try {
       if (window.parent && window.parent.__onIframePointerMove) {
         window.parent.__onIframePointerMove(e.clientX, e.clientY);
       }
     } catch (err) {}
   });
   ```
2. 在父级光标驱动 `src/animations/cursor.js` 中捕获并换算容器世界坐标：
   ```javascript
   window.__onIframePointerMove = (iframeX, iframeY) => {
     const iframe = document.getElementById('hero-connectors-iframe');
     if (!iframe) return;
     const rect = iframe.getBoundingClientRect();
     xTo(rect.left + iframeX);
     yTo(rect.top + iframeY);
     document.body.classList.add('cursor-hover-active', 'cursor-dark-theme', 'cursor-is-hand');
   };
   ```
3. 在 Iframe 内设 `canvas { cursor: none !important; }`，彻底隐藏系统鼠标，实现宿主与沙箱之间 120fps 无感丝滑衔接。

---

### 3. 纯透明手势贴图光标与外圈白盘彻底清除

#### 故障现象
悬停在 3D 视窗时，手势图标背后带着一个死板的纯白色圆形底盘，遮挡了 3D 场景内容，视觉突兀。

#### 根本原因分析
通用的 `body.cursor-hover-active #cursor-ring` 样式将光标外环写死为 58px 的实心白色圆形胶囊，用于呈现带有文字标签的按钮状态。

#### 解决方案
1. 在 `src/style.css` 明确解耦专用的 `cursor-is-hand` 状态，强行清空外层环状容器的背景、边框与阴影：
   ```css
   body.cursor-is-hand #cursor-ring {
     width: auto !important;
     height: auto !important;
     top: -15px !important;
     left: -15px !important;
     background: transparent !important;
     border: none !important;
     box-shadow: none !important;
   }
   ```
2. 手势 SVG 使用白底实心填充（`fill="#ffffff"`）结合 1.5px 深色细边框（`stroke="#111111"`）与柔和投影，确保在黑、白、红、蓝任意接头材质前均清晰悬浮。

---

### 4. 2.5D 深度视差卡片文字重影与边缘撕裂根除算法

#### 故障现象
鼠标在作品卡片（如 `Spaace`、`Atlas`）悬停并左右晃动时，卡片上的高对比文字（如白色 "spaace"）出现明显的重影分裂、字符克隆和彩色条纹叠影。

#### 根本原因分析
1. **位移系数过大**：`u_strength` 被设定为 `0.045`，在 1000px 宽度卡片上产生接近 30px 的像素级横向撕裂；
2. **伪色散倍率通道分离**：着色器对 R、G、B 分别乘以 `1.03` 与 `0.97` 进行采样，放大了字形重影并产生刺眼的彩边；
3. **遮挡伪影（Occlusion Artifact）**：背景深度（≈0.1）在位移后跨过了深度断崖直接采样到了前景文字（≈0.9）的纹理，导致文字在背景上被“二次绘制”。

#### 解决方案
1. **边缘遮挡智能滤波（Edge-Preserving Occlusion Filter）**：
   在片段着色器中同时对比采样前后的深度跃迁量 `depthJump`。当背景试图越界侵入前景文字时，通过 `smoothstep` 智能衰减位移量，从数学层面杜绝文字被重复采样：
   ```glsl
   float depth = texture2D(u_depthTexture, uv).r;
   vec2 offset = u_mouse * (depth - 0.5) * (u_strength * (0.3 + 0.7 * u_hover));
   vec2 targetUv = clamp(uv + offset, 0.0, 1.0);
   float targetDepth = texture2D(u_depthTexture, targetUv).r;

   // 阻止背景像素跨越深度断崖盗用文字纹理
   float depthJump = max(0.0, targetDepth - depth);
   vec2 finalUv = mix(targetUv, uv, smoothstep(0.06, 0.22, depthJump));

   gl_FragColor = texture2D(u_texture, finalUv);
   ```
2. **校准视差力度**：调谐 `u_strength` 至舒适细腻的 `0.015`；
3. **统一 RGB 采样**：消除假性色彩通道分离，使文字如雕塑般稳定立体。

---

### 5. Showreel 3D 蓝色曲线生命周期管理与钉住坐标对齐

#### 故障现象
Showreel 板块的 3D 蓝色管线在用户向下滚动越出第二屏后依然漂浮在后续的项目卡片上，或因页面 Pin Spacer 的位移导致轨迹错位。

#### 解决方案
1. 还原 Lusion 经典的 10 节点空间环绕样条曲线（`CatmullRomCurve3`），优雅绕过卡片背部与底部；
2. 结合 GSAP `ScrollTrigger` 严格限制管线有效生命周期：
   ```javascript
   ScrollTrigger.create({
     trigger: "#home-reel",
     start: "top top",
     end: "+=2600",
     pin: true,
     scrub: 1,
     onLeave: () => sceneManager?.setRibbonVisible(false),
     onLeaveBack: () => sceneManager?.setRibbonVisible(false),
     onEnter: () => sceneManager?.setRibbonVisible(true),
     onEnterBack: () => sceneManager?.setRibbonVisible(true),
     onUpdate: (self) => sceneManager?.setRibbonProgress(self.progress)
   });
   ```
3. 离开第二屏时立刻隐匿管线，杜绝视觉干扰。

---

### 6. Lenis 虚拟平滑滚动与 GSAP ScrollTrigger 渲染管线对齐

#### 故障现象
在快速滚动或锚点跳转时，ScrollTrigger 绑定的时间轴出现卡顿脱节或计算位置滞后。

#### 根本原因分析
Lenis 采用虚拟缓动差值计算滚动位置，如果未将其并入 GSAP 的主 Ticker 渲染循环，ScrollTrigger 会按原生不同步的 `window.scrollY` 进行求值。

#### 解决方案
将 Lenis 的 RAF 循环全面托管给 GSAP Ticker：
```javascript
lenis.on('scroll', (e) => {
  ScrollTrigger.update();
  if (sceneManager) {
    const scrollProgress = e.progress || (window.scrollY / (document.body.scrollHeight - window.innerHeight));
    sceneManager.setScrollProgress(scrollProgress);
  }
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

---

### 7. 复杂明暗交替背景下的黑白双层高对比自适应光标

#### 故障现象
单色（纯黑或纯白）光标在穿行于黑色 3D 视窗与白色排版页面之间时，常因同色背景导致光标“隐形”。

#### 解决方案
在 `src/style.css` 构建复合双层高对比几何结构：
- **核心点**：纯黑实心核心（`#000000`），外覆 1.5px 半透明纯白轮廓环（`rgba(255, 255, 255, 0.9)`）与 3px 柔和暗阴影，任何色彩背景下绝不丢失焦点；
- **跟随外环**：支持动态主题感知，当探测到深色目标容器时自动激活 `.cursor-dark-theme`，光标标签与边框毫秒级反相响应。
