import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {noise3D} from '@remotion/noise';
import {Chapter} from '../components/Chapter';
import {KineticText} from '../components/Kinetic';
import {useBass} from '../components/useSpectrum';
import {C, FONT} from '../theme';

const N = 2600;      // particles
const LIFE = 120;    // frames each particle lives
const TRAIL = 14;    // integration steps drawn as a trail
const W = 1920, H = 1080;

// Stateless flow field: a particle's position at frame f is obtained by integrating the
// curl-ish noise field from its (deterministic) birth point. Nothing is carried between frames,
// so any frame can be rendered on its own, in any order, by any of Remotion's parallel tabs.
const field = (x: number, y: number, t: number) => {
  const s = 0.0016;
  const a = noise3D('flow', x * s, y * s, t) * Math.PI * 2.2;
  return [Math.cos(a), Math.sin(a)];
};

export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const bass = useBass();
  const seeds = useMemo(() => Array.from({length: N}, (_, i) => ({
    x: random(`px${i}`) * W, y: random(`py${i}`) * H, off: Math.floor(random(`po${i}`) * LIFE),
    hue: random(`ph${i}`),
  })), []);
  const fadeIn = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});

  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#04050c';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const t = frame / 300;
    const speed = 3.2 + bass * 2.5;
    for (const p of seeds) {
      const age = (frame + p.off) % LIFE;
      const cycle = Math.floor((frame + p.off) / LIFE);
      // re-seed birth point every life cycle
      let x = (p.x + cycle * 397.13) % W, y = (p.y + cycle * 211.7) % H;
      const pts: number[] = [];
      for (let k = 0; k < age; k++) {
        const [vx, vy] = field(x, y, t);
        x += vx * speed; y += vy * speed;
        if (k >= age - TRAIL) pts.push(x, y);
      }
      if (pts.length < 4) continue;
      const life = Math.sin((age / LIFE) * Math.PI);
      const h = 180 + p.hue * 150; // cyan → magenta
      ctx.strokeStyle = `hsla(${h}, 95%, ${55 + bass * 15}%, ${0.55 * life})`;
      ctx.lineWidth = 1.6 + p.hue * 1.4;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
      ctx.stroke();
    }
  }, [frame, seeds, bass]);

  return (
    <AbsoluteFill style={{background: '#04050c'}}>
      <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, opacity: fadeIn}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
      <Chapter index="04 / 06" en="Particles × noise fields" zh="粒子系统 × 噪声流场" color={C.cyan} out={380} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <KineticText text="2,600 particles" size={110} font={FONT.display} weight={700} delay={60} stagger={2} seed="p1" exitAt={360} glow="rgba(56,232,255,0.5)" />
        <div style={{height: 20}} />
        <KineticText text="zero state between frames" size={54} font={FONT.sans} weight={400} delay={100} stagger={1} seed="p2" exitAt={365} color={C.dim} />
        <div style={{height: 14}} />
        <KineticText text="每一帧都可以独立渲染" size={54} font={FONT.cjk} weight={700} delay={140} stagger={4} seed="p3" exitAt={370} color={C.ink} letterSpacing={10} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
