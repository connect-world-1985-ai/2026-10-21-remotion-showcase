import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Chapter} from '../components/Chapter';
import {C, FONT} from '../theme';

type Row = {label: string; color: string; fn: (f: number, fps: number) => number};
const DUR = 60; // frames for eased (non-spring) motions
const ease = (e: (t: number) => number) => (f: number) =>
  interpolate(f, [0, DUR], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const ROWS: Row[] = [
  {label: 'linear', color: '#8892a6', fn: ease((t) => t)},
  {label: 'Easing.inOut(Easing.cubic)', color: C.cyan, fn: ease(Easing.inOut(Easing.cubic))},
  {label: 'Easing.bezier(.7,-0.4,.3,1.4)', color: C.violet, fn: ease(Easing.bezier(0.7, -0.4, 0.3, 1.4))},
  {label: 'Easing.out(Easing.bounce)', color: C.amber, fn: ease(Easing.out(Easing.bounce))},
  {label: 'spring({damping: 200})', color: C.lime, fn: (f, fps) => spring({frame: f, fps, config: {damping: 200}})},
  {label: 'spring({damping: 8})', color: C.magenta, fn: (f, fps) => spring({frame: f, fps, config: {damping: 8}})},
  {label: 'spring({mass: 4, damping: 14})', color: '#ff7a45', fn: (f, fps) => spring({frame: f, fps, config: {mass: 4, damping: 14}})},
];

const START = 70, BACK = 270;
const TRACK_X = 110, TRACK_W = 900, PLOT_X = 1150, PLOT_W = 660, PLOT_H = 600, PLOT_Y = 330;

export const Springs: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grid = interpolate(frame, [0, 40], [0, 1], {extrapolateRight: 'clamp'});
  const plotT = Math.min(Math.max(frame - START, 0), 120);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #121733 0%, #05060f 70%)'}}>
      <AbsoluteFill style={{opacity: grid * 0.25, backgroundImage:
        'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
        backgroundSize: '60px 60px'}} />
      <Chapter index="01 / 06" en="Spring physics & easing" zh="弹簧物理与缓动曲线" color={C.lime} out={420} />
      {ROWS.map((r, i) => {
        const y = 360 + i * 92;
        const appear = spring({frame: frame - 20 - i * 4, fps, config: {damping: 200}});
        const v = r.fn(frame - START - i * 2, fps) - r.fn(frame - BACK - i * 2, fps);
        const x = TRACK_X + v * TRACK_W;
        const trail = Array.from({length: 6}, (_, k) => {
          const vv = r.fn(frame - k * 1.5 - START - i * 2, fps) - r.fn(frame - k * 1.5 - BACK - i * 2, fps);
          return TRACK_X + vv * TRACK_W;
        });
        return (
          <div key={r.label} style={{opacity: appear, transform: `translateX(${(1 - appear) * -80}px)`}}>
            <div style={{position: 'absolute', left: TRACK_X, top: y - 34, fontFamily: FONT.mono, fontSize: 20, color: r.color}}>{r.label}</div>
            <div style={{position: 'absolute', left: TRACK_X, top: y, width: TRACK_W + 28, height: 2, background: 'rgba(255,255,255,0.12)'}} />
            {trail.map((tx, k) => (
              <div key={k} style={{position: 'absolute', left: tx, top: y - 13 + 1, width: 28, height: 28, borderRadius: 14,
                background: r.color, opacity: (0.35 * (6 - k)) / 6, filter: 'blur(4px)'}} />
            ))}
            <div style={{position: 'absolute', left: x, top: y - 13, width: 28, height: 28, borderRadius: 14, background: r.color,
              boxShadow: `0 0 24px ${r.color}`}} />
          </div>
        );
      })}
      {/* live plot of value over time */}
      <svg style={{position: 'absolute', left: PLOT_X, top: PLOT_Y - 60}} width={PLOT_W + 40} height={PLOT_H + 120}>
        <g transform="translate(20,60)" opacity={grid}>
          <rect x={0} y={0} width={PLOT_W} height={PLOT_H} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" />
          <line x1={0} x2={PLOT_W} y1={PLOT_H * 0.25} y2={PLOT_H * 0.25} stroke="rgba(255,255,255,0.25)" strokeDasharray="6 6" />
          <text x={8} y={PLOT_H * 0.25 - 10} fill={C.dim} fontFamily={FONT.mono} fontSize={18}>target = 1.0</text>
          <text x={8} y={PLOT_H - 12} fill={C.dim} fontFamily={FONT.mono} fontSize={18}>value(t) · 120 frames</text>
          {ROWS.map((r, i) => {
            const pts: string[] = [];
            for (let t = 0; t <= plotT; t += 1) {
              const v = r.fn(t - i * 2, fps);
              pts.push(`${(t / 120) * PLOT_W},${PLOT_H - (PLOT_H * 0.75) * v - 0}`);
            }
            return <polyline key={r.label} points={pts.join(' ')} fill="none" stroke={r.color} strokeWidth={3} strokeLinejoin="round" />;
          })}
        </g>
      </svg>
      <div style={{position: 'absolute', left: PLOT_X + 20, top: PLOT_Y + PLOT_H + 70, fontFamily: FONT.sans, fontSize: 24, color: C.dim, width: PLOT_W, opacity: grid}}>
        Every curve is a pure function of the frame number — no timeline, no keyframes.
        <span style={{fontFamily: FONT.cjk}}>　每一条曲线都只是帧号的纯函数。</span>
      </div>
    </AbsoluteFill>
  );
};
