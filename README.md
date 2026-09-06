# LUSION-RE

A desktop-focused recreation of the visual rhythm and interaction language of [Lusion.co](https://lusion.co/). It is intended for front-end learning, motion prototyping, and non-commercial experimentation.

> This is an independent reconstruction, not the official Lusion website. The current build intentionally does not include mobile adaptation, and project-card destinations remain placeholders.

## Highlights

- Interactive Rapier/WASM connector scene embedded in the hero.
- GSAP ScrollTrigger and Lenis-powered editorial scroll choreography.
- Showreel sequence with a scroll-drawn blue SVG ribbon placed behind the primary content.
- Transparent floating header with smoothly animated sound and MENU/CLOSE controls.
- Modular navigation panels with current-section state, hover feedback, focus trapping, and Escape-to-close.
- Twelve aligned project cards with lightweight pointer tilt and image parallax.
- Local H.264 showreel playback in an accessible modal.
- Native OS arrow/hand cursors, including inside the same-origin 3D iframe.
- `prefers-reduced-motion` support and synchronized ARIA control states.

## Tech stack

| Area | Implementation |
| --- | --- |
| Build | Vite 6, native ES modules |
| Motion | GSAP 3, ScrollTrigger, Lenis |
| 3D hero | Bundled pmndrs connector demo, Rapier WASM, WebGL |
| UI audio | Web Audio API with a canvas waveform |
| Styling | Plain CSS with a desktop minimum width of 1024px |

## Getting started

Requirements: Node.js 18 or newer and npm.

```bash
git clone https://github.com/pyw110001/LUSION-RE.git
cd LUSION-RE
npm ci
npm run dev
```

The Vite development server opens automatically and uses:

```text
http://localhost:3000/
```

Create and preview a production build:

```bash
npm run build
npm run preview
```

The optimized output is written to `dist/`.

## Interaction notes

- Click the sound control once to enable synthesized hover/click feedback. Browsers require this user gesture before creating audible output.
- The idle dash crossfades and scales into the animated waveform; button color and shadow use the same eased transition language.
- MENU and CLOSE occupy the same layout slot and crossfade with vertical movement and scale, so rapid open/close reversals remain continuous.
- Project cards currently focus an accessible “coming soon” placeholder instead of navigating to detail pages.
- The 3D hero remains interactive through its iframe; native pointer styling is injected after the iframe is ready.

## Project structure

```text
index.html                         Semantic page, menu, cards, and video dialog
src/
  main.js                         App bootstrap, iframe cursor setup, card interaction
  style.css                       Desktop layout, states, transitions, accessibility
  animations/
    magnetic.js                   Magnetic button response
    menu.js                       Menu timeline, ARIA state, keyboard handling
    scroll.js                     Lenis and ScrollTrigger choreography
    cursor.js                     Retained legacy custom-cursor experiment; not initialized
  utils/
    audio.js                      Web Audio feedback and canvas waveform
    TextAnimationHelper.js        Hover text decoding
  webgl/                          Retained experiments; not used for project-card rendering
public/
  assets/                         Project images, backgrounds, and local showreel
  lusion-connectors/              Standalone 3D connector app, bundle, GLB, and WASM
design-qa.md                      Current desktop visual and interaction QA record
TROUBLESHOOTING.md                Runtime diagnostics and implementation notes
```

## Verification

The baseline repository check is:

```bash
npm run build
```

For visual and interaction coverage, see [design-qa.md](./design-qa.md). For startup, rendering, cursor, audio, video, and animation diagnostics, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Credits and usage

- Visual and interaction reference: [Lusion.co](https://lusion.co/).
- Connector physics demo and related assets: [pmndrs examples](https://github.com/pmndrs/examples).
- The reconstruction includes locally stored media and reference assets. Confirm all applicable rights before publishing, redistributing, or using it commercially.

No license is granted for third-party branding or media by this repository.

---

## 中文说明

这是一个针对桌面端制作的 Lusion 首页交互复现项目，用于学习滚动叙事、微交互和 WebGL 场景整合，并非 Lusion 官方网站。

### 当前实现

- 首屏嵌入 Rapier/WASM 十字接头物理场景，支持鼠标交互。
- 使用 GSAP ScrollTrigger 与 Lenis 编排页面进入、钉住和滚动转场。
- Showreel 蓝色 SVG 管线随滚动绘制，并保持在标题、说明和媒体内容的底层。
- 顶部导航为透明悬浮结构；音频横线/波形以及 MENU/CLOSE 均使用连续的淡入、位移、缩放和颜色过渡。
- 菜单支持当前栏目状态、悬停反馈、焦点循环和 Escape 关闭。
- 12 张作品卡片采用轻量级倾斜与图片视差，不再为每张卡片长期运行独立 WebGL 渲染器。
- 视频弹窗使用本地有效 H.264 文件，并具备基础键盘和焦点管理。
- 页面使用系统原生箭头和手型光标，3D iframe 内也会恢复可见手型光标。
- 支持 `prefers-reduced-motion`，音频和菜单状态同步更新 ARIA 属性。

### 本地运行

需要 Node.js 18 或更高版本。

```bash
git clone https://github.com/pyw110001/LUSION-RE.git
cd LUSION-RE
npm ci
npm run dev
```

开发地址默认为 `http://localhost:3000/`。生产构建使用：

```bash
npm run build
npm run preview
```

### 已知范围

- 不做移动端适配，页面最小宽度为 1024px。
- 作品案例链接仍为 “coming soon” 占位行为。
- 首次使用音效必须由用户点击音频按钮，以满足浏览器自动播放策略。
- 发布或商业使用前，请自行确认原站视觉、品牌和媒体素材的授权范围。

完整验证记录见 [design-qa.md](./design-qa.md)，常见问题与定位方法见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)。
