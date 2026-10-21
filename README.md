# The Making of Motion · 运动的诞生 — a Remotion ceiling test

A 100-second, 1080p/30fps showcase video written entirely as React code with
[Remotion](https://www.remotion.dev), built and rendered locally by an AI agent (Mary) on 2026-10-21.
The goal was to see how far **Remotion + an agent's coding skills** can go in a single video:
one composition that strings together most of Remotion's capability surface — physics-based
animation, kinetic typography, SVG path work, real-data visualisation, a GLSL shader, a stateless
particle system, a three.js scene, shader/CSS transitions, and audio-reactive visuals driven by a
soundtrack that was itself synthesised from scratch.

- **Final video:** [`2026-10-21-renders/remotion-showcase.mp4`](2026-10-21-renders/remotion-showcase.mp4) — 1920×1080, 30 fps, 3000 frames, 100.0 s, H.264 CRF 20 + AAC, 59 MB
- **Contact sheet (one frame per scene + a transition):** [`2026-10-21-renders/contact-sheet.jpg`](2026-10-21-renders/contact-sheet.jpg)

## Why this theme

A "making of motion" portfolio lets every scene be *about* the technique it shows, so the video
doubles as its own explainer. A single narrative (from the first spring to "code is the camera"),
a shared colour system, a persistent HUD (timecode, progress bar, live spectrum) and a soundtrack
whose sections are cut to the scene boundaries keep seven very different techniques reading as one
film rather than a tech-demo reel.

## Scene by scene

All timings are in the final timeline (transitions overlap scenes by 30 frames = 1 s = 2 beats).

| # | Time | Scene | What you see | Main techniques |
|---|------|-------|--------------|-----------------|
| 0 | 0:00–0:13 | **Intro** | Title "THE MAKING OF MOTION / 运动的诞生" flies in letter-by-letter over a slowly zooming domain-warped noise field; a terminal line types itself out. | Raw WebGL GLSL fragment shader on `<canvas>` (fBm domain warping, cosine palette, vignette, grain), per-glyph `spring()` with seeded `random()` 3D offsets + blur, `interpolate` + `Easing` |
| 1 | 0:12–0:27 | **Spring physics & easing · 弹簧物理与缓动曲线** | Seven balls race with linear, cubic, overshooting bezier, bounce and three different spring configs, with motion trails; a live plot draws each curve as it happens. | `spring()` (damping/mass), `Easing.bezier/bounce/inOut`, SVG polylines rebuilt per frame |
| 2 | 0:26–0:40 | **SVG path drawing & morphing · 路径描绘与形状变形** | Three Lissajous curves draw themselves, arrowheads ride along them following the tangent; a centre shape draws on and morphs triangle → star → heart → hexagon → circle, on the beat. | `@remotion/paths` (`evolvePath`, `interpolatePath`, `getPointAtLength`, `getTangentAtLength`, `getLength`), `@remotion/shapes` (`makePolygon/Star/Heart/Circle`), SVG filters |
| 3 | 0:39–0:57 | **Real data, animated · 真实数据 · 动态图表** | Mauna Loa annual-mean CO₂, 1959–2025, drawn year by year with a running counter, gradient area reveal, milestone call-outs (first year ≥350 and ≥400 ppm, computed from the data) and a springy "rise per decade" bar chart. | Real public data (NOAA GML CSV → `src/data/co2.ts`), `evolvePath`, SVG `clipPath` reveal, staggered springs |
| 4 | 0:56–1:10 | **Particles × noise fields · 粒子系统 × 噪声流场** | 2,600 glowing streaks flow through a 3D simplex-noise field; brightness and speed pulse with the bass. | `@remotion/noise` `noise3D`, Canvas 2D additive blending, **stateless** simulation (each particle's position is re-integrated from its seeded birth point every frame, so frames can render in any order in parallel tabs), audio-reactive via `visualizeAudio` |
| 5 | 1:09–1:26 | **Three.js inside React · 三维场景 · 随音乐律动** | Orbiting camera around a faceted icosahedron (wireframe overlay), six coloured torus knots, a ring of 48 bars whose heights are live FFT bins of the soundtrack, grid floor. | `@remotion/three` `ThreeCanvas`, react-three-fiber, three.js standard materials + point/hemisphere lights, camera driven from the frame number |
| 6 | 1:25–1:40 | **Finale** | Radial 96-spoke audio spectrum ring over a faster, warmer variant of the shader; "Code is the camera. / 代码即镜头"; credits; fade to black. | `visualizeAudio` (128 bins, mirrored), shader re-used with different uniforms, kinetic text |

**Transitions** (`@remotion/transitions` `TransitionSeries`): iris → slide (spring timing) → wipe →
fade → flip (spring timing) → clock wipe.
**Global overlay:** REC timecode + frame counter, gradient progress bar, a 40-bar live spectrum.

## Soundtrack

`public/soundtrack.mp3` was **composed and synthesised from scratch** by
[`2026-10-21-music/compose.py`](2026-10-21-music/compose.py) using only numpy + ffmpeg (no samples,
no AI model, no third-party audio), so there are no licensing questions: it is original work made for
this repo. 120 BPM was chosen because one beat is exactly 15 frames at 30 fps, which makes beat-locked
animation trivial. A-minor i–VI–III–VII progression; additive-saw pads, plucked bass, arpeggio, sine
"bell" lead, synthesised kick/snare/hats, noise risers and sub impacts before every scene change, a
snare roll into the 3D "drop", FFT-convolution reverb, tanh soft-clip mastering. Sections are aligned
to the scene boundaries (0/12/26/39/56/69/85/100 s). Regenerate with `python3 2026-10-21-music/compose.py`.

## Data source

Mauna Loa CO₂ annual mean (ppm), NOAA Global Monitoring Laboratory —
<https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv>, downloaded 2026-10-21 (raw copy in
[`2026-10-21-data/`](2026-10-21-data/)). Credit: Dr. Xin Lan, NOAA/GML, and Dr. Ralph Keeling, Scripps
Institution of Oceanography. Values are plotted as published; milestones and per-decade rises are
computed from the file, nothing is hand-entered.

## Fonts / Chinese text

Latin: Inter, Space Grotesk, JetBrains Mono via `@remotion/google-fonts` (Latin subset only).
Chinese: Google's Noto Sans SC is split into ~100 unicode-range files per weight, which would make
every parallel render tab fetch dozens of files, so CJK falls back to the locally installed
**Noto Sans CJK SC** (same family, via fontconfig). Verified on the contact sheet: no tofu boxes.

## Tools and versions

| Tool | Version |
|------|---------|
| Node.js / npm | 20.19.2 / 11.21.0 |
| remotion, @remotion/cli, three, transitions, noise, media-utils, paths, shapes, google-fonts | 4.0.537 |
| React / react-dom | 19.3.1 |
| three.js / @react-three/fiber | 0.186.1 / 9.8.2 |
| Chrome Headless Shell (downloaded by Remotion) | 157.0.8080.0 |
| ffmpeg / ffprobe | 7.1.5 |
| Python / numpy (soundtrack) | 3.13.5 / 2.5.4 |
| Pillow (contact sheet) | system |

## Preview and render

```bash
npm install
npx remotion studio            # interactive preview at http://localhost:3000
npx remotion render Showcase 2026-10-21-renders/remotion-showcase.mp4 \
  --codec=h264 --crf=20 --concurrency=50% --gl=swangle
# or: npm run render
npx remotion still Showcase frame.jpg --frame=2320   # single frame
python3 2026-10-21-tools/contact_sheet.py sheet.jpg a.jpg b.jpg ...   # 2-column contact sheet
```

`remotion.config.ts` already sets JPEG frames, `swangle` GL and 50 % concurrency.

## Render stats

- Machine: 8 vCPU / 15 GB cloud box, **shared with other heavy jobs** (load average 13–29 during the render).
- Full render: **825 s (13 min 45 s)** for 3000 frames, concurrency 4 tabs, `--gl=swangle` → average 3.6 frames/s.
- Very uneven: the first ~1,730 frames (intro → data viz, mostly DOM/SVG + a half-res shader) took under 2 minutes; the particle scene (CPU noise integration, ~150 k `noise3D` calls per frame) and the software-rasterised three.js scene took most of the remaining ~12 minutes.
- Output: 59.2 MB, 4.74 Mb/s, ffprobe confirms 3000 video frames, 30/1 fps, 100.01 s, AAC audio (mean −17.1 dB, peak −2.4 dB). `blackdetect` found no black segments longer than 0.5 s.

## Honest assessment

**What impressed**
- Remotion's "a frame is a pure function" model is genuinely agent-friendly: every scene is ordinary
  React/TypeScript, debuggable one frame at a time with `remotion still`, and the whole film was
  written, checked and fixed by looking at stills — no GUI editor at all.
- The breadth in one codebase is real: GLSL, Canvas2D particles, SVG morphing, real data, three.js and
  audio analysis compose cleanly, and `visualizeAudio` makes audio-reactivity a few lines of code.
- Determinism holds: seeded `random()`/`noise3D` and the stateless particle design meant parallel tabs
  produced a seamless result with no flicker between chunks.

**Limits found**
- **WebGL in headless Chrome is the weak spot.** With `--gl=angle` on this GPU-less box the raw shader
  silently rendered **black** and three.js threw "Error creating WebGL context". `--gl=swangle`
  (SwiftShader software GL) fixed both, but it is CPU rasterisation: the shader is drawn at half
  resolution and upscaled, and 3D scenes are the slowest frames. On a GPU machine `angle` should work
  and be far faster.
- Shape morphing between topologically different shapes (`interpolatePath` from heart to hexagon)
  produces some awkward in-between silhouettes; a production piece would hand-tune the point
  correspondence or use matching point counts.
- No post effects beyond CSS/SVG blur and additive blending (no real bloom, depth of field or motion
  blur on the 3D); `@remotion/motion-blur` or a post-processing pass would add polish at a large
  render-time cost.
- The newer HTML-in-canvas shader transitions in `@remotion/transitions` (crosswarp, film-burn,
  ripple…) were deliberately not used: they need experimental Chrome features and would have risked the
  headless render. The six classic transitions all worked first time.
- The soundtrack is competent library-music-grade synthesis, not a produced track — mixing is basic and
  the timbres are simple. It serves the edit (exact beat grid, scene-aligned risers) better than it
  would stand alone.
- Overall: a convincing "motion-design studio reel" level, comparable to a solid After Effects
  template, produced in roughly 30 minutes of coding plus 14 minutes of rendering. It is not yet at the
  level of hand-crafted broadcast motion design (no illustrated assets, no lighting/compositing finesse).

## Project layout

```
src/                     Remotion source (Root, Showcase, scenes/, components/, data/co2.ts)
public/soundtrack.mp3    synthesised soundtrack used by <Audio> and visualizeAudio
2026-10-21-music/        compose.py (numpy synth); the WAV master is regenerated, not committed
2026-10-21-data/         raw NOAA CSV
2026-10-21-tools/        contact_sheet.py
2026-10-21-renders/      final MP4 + contact sheet
remotion.config.ts       render defaults (jpeg frames, swangle GL, 50% concurrency)
```

## License notes

Remotion is **free for individuals and small teams (up to 3 people)**; companies above that size
need a company license — see <https://remotion.dev/license>. The code, soundtrack and video in this
repo are original work; the CO₂ data is public NOAA data credited above.
